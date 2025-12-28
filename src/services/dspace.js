import api from './api'
import { isValidUuid, sanitizeSearchQuery, debugLog } from '@/utils/security'

/**
 * DSpace REST API Service
 * Handles all interactions with DSpace 7.x REST API
 */

// ===========================================
// CACHE IMPLEMENTATION FOR PERFORMANCE
// ===========================================

/**
 * Simple cache with TTL (Time To Live)
 */
class ApiCache {
  constructor(ttl = 5 * 60 * 1000) { // Default 5 minutes TTL
    this.cache = new Map()
    this.ttl = ttl
  }

  /**
   * Generate cache key from request parameters
   */
  generateKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`
  }

  /**
   * Get cached data if valid
   */
  get(key) {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set cache data
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Clear specific cache entry
   */
  delete(key) {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Create cache instances for different data types
const facetsCache = new ApiCache(10 * 60 * 1000) // 10 minutes for facets
const searchCache = new ApiCache(2 * 60 * 1000)  // 2 minutes for search results
const itemCache = new ApiCache(5 * 60 * 1000)    // 5 minutes for items
const statsCache = new ApiCache(15 * 60 * 1000)  // 15 minutes for statistics

// Cleanup caches periodically
setInterval(() => {
  facetsCache.cleanup()
  searchCache.cleanup()
  itemCache.cleanup()
  statsCache.cleanup()
}, 60 * 1000) // Cleanup every minute

/**
 * Validate UUID parameter
 * @param {string} id - UUID to validate
 * @throws {Error} If UUID is invalid
 */
function validateId(id) {
  if (!isValidUuid(id)) {
    throw new Error('Invalid resource identifier')
  }
}

// Communities API
export const communities = {
  /**
   * Get all communities
   * @param {Object} params - Query parameters
   */
  async getAll(params = {}) {
    const response = await api.get('/core/communities', { params })
    return response.data
  },

  /**
   * Get top-level communities
   */
  async getTopLevel(params = {}) {
    const response = await api.get('/core/communities/search/top', { params })
    return response.data
  },

  /**
   * Get a specific community by ID
   * @param {string} id - Community UUID
   */
  async getById(id) {
    validateId(id)
    const response = await api.get(`/core/communities/${id}`)
    return response.data
  },

  /**
   * Get sub-communities of a community
   * @param {string} id - Parent community UUID
   */
  async getSubcommunities(id, params = {}) {
    validateId(id)
    const response = await api.get(`/core/communities/${id}/subcommunities`, { params })
    return response.data
  },

  /**
   * Get collections within a community
   * @param {string} id - Community UUID
   */
  async getCollections(id, params = {}) {
    validateId(id)
    const response = await api.get(`/core/communities/${id}/collections`, { params })
    return response.data
  }
}

// Collections API
export const collections = {
  /**
   * Get all collections
   */
  async getAll(params = {}) {
    const response = await api.get('/core/collections', { params })
    return response.data
  },

  /**
   * Get a specific collection by ID
   * @param {string} id - Collection UUID
   */
  async getById(id) {
    validateId(id)
    const response = await api.get(`/core/collections/${id}`)
    return response.data
  },

  /**
   * Get items in a collection
   * @param {string} id - Collection UUID
   */
  async getItems(id, params = {}) {
    validateId(id)
    const response = await api.get('/discover/search/objects', {
      params: {
        ...params,
        scope: id,
        dsoType: 'item'
      }
    })
    return response.data
  }
}

// Items API
export const items = {
  /**
   * Get all items
   */
  async getAll(params = {}) {
    const response = await api.get('/core/items', { params })
    return response.data
  },

  /**
   * Get a specific item by ID with caching
   * @param {string} id - Item UUID
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async getById(id, useCache = true) {
    validateId(id)

    // Check cache first
    if (useCache) {
      const cacheKey = itemCache.generateKey('item', { id })
      const cached = itemCache.get(cacheKey)
      if (cached) {
        debugLog.log('Item cache hit:', id)
        return cached
      }
    }

    const response = await api.get(`/core/items/${id}`)

    // Cache the response
    if (useCache) {
      const cacheKey = itemCache.generateKey('item', { id })
      itemCache.set(cacheKey, response.data)
    }

    return response.data
  },

  /**
   * Get item bundles
   * @param {string} id - Item UUID
   */
  async getBundles(id, size = 50) {
    validateId(id)
    // Use a larger size to get all bundles
    const response = await api.get(`/core/items/${id}/bundles`, {
      params: { size }
    })
    return response.data
  },

  /**
   * Get item metadata
   * @param {string} id - Item UUID
   */
  async getMetadata(id) {
    validateId(id)
    const item = await this.getById(id)
    return item.metadata
  },

  /**
   * Get recent items with caching
   * @param {number} limit - Number of items to return
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async getRecent(limit = 10, useCache = true) {
    const params = {
      sort: 'dc.date.accessioned,DESC',
      size: limit,
      dsoType: 'item'
    }

    // Check cache first
    if (useCache) {
      const cacheKey = searchCache.generateKey('recent', params)
      const cached = searchCache.get(cacheKey)
      if (cached) {
        debugLog.log('Recent items cache hit')
        return cached
      }
    }

    const response = await api.get('/discover/search/objects', { params })

    // Cache the response
    if (useCache) {
      const cacheKey = searchCache.generateKey('recent', params)
      searchCache.set(cacheKey, response.data)
    }

    return response.data
  },

  /**
   * Clear item cache
   */
  clearCache() {
    itemCache.clear()
    debugLog.log('Item cache cleared')
  }
}

// Bitstreams API
export const bitstreams = {
  /**
   * Get bitstream by ID
   * @param {string} id - Bitstream UUID
   */
  async getById(id) {
    validateId(id)
    const response = await api.get(`/core/bitstreams/${id}`)
    return response.data
  },

  /**
   * Get bitstream content URL
   * @param {string} id - Bitstream UUID
   */
  getContentUrl(id) {
    if (!isValidUuid(id)) {
      return null
    }
    return `${api.defaults.baseURL}/core/bitstreams/${id}/content`
  },

  /**
   * Fetch bitstream content as blob and return object URL
   * This bypasses Content-Disposition: attachment headers
   * @param {string} id - Bitstream UUID
   * @param {string} mimeType - MIME type of the content
   * @returns {Promise<string>} Object URL for the blob
   */
  async getContentAsBlob(id, mimeType = 'application/octet-stream') {
    if (!isValidUuid(id)) {
      throw new Error('Invalid bitstream ID')
    }

    const url = `${api.defaults.baseURL}/core/bitstreams/${id}/content`

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Accept': mimeType
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`)
      }

      const blob = await response.blob()
      // Create blob with correct MIME type
      const typedBlob = new Blob([blob], { type: mimeType })
      return URL.createObjectURL(typedBlob)
    } catch (error) {
      debugLog.error('Failed to fetch bitstream as blob:', error)
      throw error
    }
  },

  /**
   * Revoke a blob URL to free memory
   * @param {string} blobUrl - The blob URL to revoke
   */
  revokeBlobUrl(blobUrl) {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl)
    }
  },

  /**
   * Get bitstreams in a bundle
   * @param {string} bundleId - Bundle UUID
   */
  async getByBundle(bundleId, size = 100) {
    validateId(bundleId)
    // Use a large size to get all bitstreams, DSpace default might be limited
    const response = await api.get(`/core/bundles/${bundleId}/bitstreams`, {
      params: { size }
    })
    return response.data
  }
}

// Search/Discovery API
export const search = {
  /**
   * Perform a search query with caching
   * @param {Object} params - Search parameters
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async query(params = {}, useCache = true) {
    // Sanitize query parameter if present
    const sanitizedParams = { ...params }
    if (sanitizedParams.query) {
      sanitizedParams.query = sanitizeSearchQuery(sanitizedParams.query)
    }

    const searchParams = {
      ...sanitizedParams,
      dsoType: sanitizedParams.dsoType || 'item',
      embed: 'thumbnail' // Request thumbnail in response
    }

    // Check cache first
    if (useCache) {
      const cacheKey = searchCache.generateKey('search', searchParams)
      const cached = searchCache.get(cacheKey)
      if (cached) {
        debugLog.log('Search cache hit:', cacheKey)
        return cached
      }
    }

    const response = await api.get('/discover/search/objects', {
      params: searchParams
    })

    // Cache the response
    if (useCache) {
      const cacheKey = searchCache.generateKey('search', searchParams)
      searchCache.set(cacheKey, response.data)
    }

    return response.data
  },

  /**
   * Get facets for search with caching
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async getFacets(params = {}, useCache = true) {
    // Check cache first
    if (useCache) {
      const cacheKey = facetsCache.generateKey('facets', params)
      const cached = facetsCache.get(cacheKey)
      if (cached) {
        debugLog.log('Facets cache hit:', cacheKey)
        return cached
      }
    }

    const response = await api.get('/discover/facets', { params })

    // Cache the response
    if (useCache) {
      const cacheKey = facetsCache.generateKey('facets', params)
      facetsCache.set(cacheKey, response.data)
    }

    return response.data
  },

  /**
   * Search with specific facet values and caching
   * @param {string} query - Search query
   * @param {Object} facets - Facet filters
   * @param {Object} params - Additional parameters
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async searchWithFacets(query, facets = {}, params = {}, useCache = true) {
    // Sanitize query
    const sanitizedQuery = sanitizeSearchQuery(query)

    // Build query string manually to control encoding
    // DSpace expects: f.author=value,equals (comma NOT encoded)
    const queryParts = []

    // Add query
    queryParts.push(`query=${encodeURIComponent(sanitizedQuery)}`)

    // Add dsoType
    queryParts.push(`dsoType=${params.dsoType || 'item'}`)

    // Request thumbnail to be embedded in response (DSpace 7+)
    queryParts.push('embed=thumbnail')

    // Add pagination and sort params
    if (params.page !== undefined) queryParts.push(`page=${params.page}`)
    if (params.size !== undefined) queryParts.push(`size=${params.size}`)
    if (params.sort) queryParts.push(`sort=${encodeURIComponent(params.sort)}`)
    if (params.scope) queryParts.push(`scope=${encodeURIComponent(params.scope)}`)

    // Add facet filters - DSpace expects format: f.{facetName}={value},equals
    // The comma between value and operator must NOT be URL encoded
    // But special characters in the value itself should be encoded
    Object.entries(facets).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        values.forEach(v => {
          const sanitizedValue = typeof v === 'string' ? v : String(v)
          // Encode the value but not the comma separator
          const encodedValue = encodeURIComponent(sanitizedValue)
          queryParts.push(`f.${key}=${encodedValue},equals`)
        })
      }
    })

    const queryString = queryParts.join('&')
    console.log('=== DSPACE API SEARCH ===')
    console.log('Query string:', queryString)
    console.log('Facets received:', JSON.stringify(facets))
    debugLog.log('Search URL params:', queryString)
    debugLog.log('Active facet filters:', JSON.stringify(facets))

    // Generate cache key from all parameters including facets
    const cacheKey = searchCache.generateKey('search-facets', {
      query: sanitizedQuery,
      facets: JSON.stringify(facets),
      page: params.page,
      size: params.size,
      sort: params.sort,
      scope: params.scope
    })

    // Check cache first (only if useCache is true and no facets are active)
    const hasFacets = Object.keys(facets).length > 0
    if (useCache && !hasFacets) {
      const cached = searchCache.get(cacheKey)
      if (cached) {
        debugLog.log('Search with facets cache hit')
        return cached
      }
    }

    // Make the request with the properly formatted query string
    const response = await api.get(`/discover/search/objects?${queryString}`)

    debugLog.log('Search response received, total results:',
      response.data?._embedded?.searchResult?.page?.totalElements || 0)

    // Cache the response only if no facets (facet results should always be fresh)
    if (useCache && !hasFacets) {
      searchCache.set(cacheKey, response.data)
    }

    return response.data
  },

  /**
   * Clear search and facets cache
   */
  clearCache() {
    searchCache.clear()
    facetsCache.clear()
    debugLog.log('Search cache cleared')
  }
}

// Browse API
export const browse = {
  // Map UI browse types to potential DSpace index names (try in order)
  indexMappings: {
    'author': ['author', 'dc.contributor.author', 'contributor'],
    'subject': ['subject', 'dc.subject', 'keyword'],
    'dateissued': ['dateissued', 'dc.date.issued', 'date'],
    'type': ['type', 'dc.type', 'itemtype'],
    'publisher': ['publisher', 'dc.publisher'],
    'title': ['title', 'dc.title']
  },

  // Map browse types to facet names for fallback
  facetMappings: {
    'author': 'author',
    'subject': 'subject',
    'dateissued': 'dateIssued',
    'type': 'itemtype',
    'publisher': 'publisher',
    'title': 'title'
  },

  /**
   * Browse by a specific index
   * @param {string} index - Browse index (author, title, dateissued, subject)
   */
  async byIndex(index, params = {}) {
    // Get possible index names for this browse type
    const indexNames = this.indexMappings[index] || [index]

    console.log('Fetching browse index:', index, 'trying:', indexNames, 'params:', params)

    let lastError = null

    // Try each possible index name
    for (const indexName of indexNames) {
      try {
        console.log('Trying browse index:', indexName)
        const response = await api.get(`/discover/browses/${indexName}/entries`, { params })
        console.log('Browse API response for', indexName, ':', response.data)

        // Check if we got valid data
        const hasEntries = response.data?._embedded?.entries?.length > 0 ||
                          response.data?._embedded?.browseIndexEntries?.length > 0 ||
                          response.data?.entries?.length > 0

        if (hasEntries || response.data?.page?.totalElements > 0) {
          return response.data
        }

        // Even empty results might be valid, keep trying other indices
        lastError = new Error('No entries found for index: ' + indexName)
      } catch (error) {
        console.log('Browse index', indexName, 'failed:', error.response?.status || error.message)
        lastError = error

        // If 404, try next index name
        if (error.response?.status === 404) {
          continue
        }

        // For other errors, also try next
        continue
      }
    }

    // If all index names failed, try the original without /entries
    try {
      console.log('Trying browse without /entries:', index)
      const altResponse = await api.get(`/discover/browses/${index}`, { params })
      console.log('Alternative browse response:', altResponse.data)

      const hasEntries = altResponse.data?._embedded?.entries?.length > 0 ||
                        altResponse.data?._embedded?.browseIndexEntries?.length > 0

      if (hasEntries || altResponse.data?.page?.totalElements > 0) {
        return altResponse.data
      }
    } catch (altError) {
      console.log('Alternative browse also failed:', altError.message)
    }

    // Fallback: Use search facets API to get values
    console.log('Falling back to facets API for:', index)
    return await this.getEntriesFromFacets(index, params)
  },

  /**
   * Get browse entries from search facets API (fallback)
   */
  async getEntriesFromFacets(index, params = {}) {
    const facetName = this.facetMappings[index] || index
    console.log('Getting facet values for:', facetName)

    try {
      // Try to get facet values from search API
      const response = await api.get('/discover/facets/' + facetName, {
        params: {
          page: params.page || 0,
          size: params.size || 20
        }
      })

      console.log('Facet API response:', response.data)

      // Transform facet values to browse entry format
      const values = response.data?._embedded?.values || []
      const entries = values.map(v => ({
        value: v.label || v.value,
        count: v.count || 0,
        authority: v.authorityKey || null
      }))

      return {
        _embedded: { entries },
        page: response.data?.page || {
          totalElements: entries.length,
          totalPages: Math.ceil(entries.length / (params.size || 20)),
          number: params.page || 0
        }
      }
    } catch (facetError) {
      console.error('Facet API failed:', facetError.message)

      // Last resort: try search with aggregation
      try {
        const searchResponse = await api.get('/discover/search/objects', {
          params: {
            query: '*',
            dsoType: 'item',
            size: 0 // We only want facets, not results
          }
        })

        // Extract facet from search response
        const facets = searchResponse.data?._embedded?.facets || []
        const targetFacet = facets.find(f => f.name === facetName || f.name === index)

        if (targetFacet?._embedded?.values) {
          const entries = targetFacet._embedded.values.map(v => ({
            value: v.label || v.value,
            count: v.count || 0
          }))

          return {
            _embedded: { entries },
            page: {
              totalElements: entries.length,
              totalPages: 1,
              number: 0
            }
          }
        }
      } catch (searchError) {
        console.error('Search facet fallback also failed:', searchError.message)
      }

      throw new Error('Could not load browse entries for: ' + index)
    }
  },

  /**
   * Get browse indices available on server
   */
  async getIndices() {
    try {
      const response = await api.get('/discover/browses')
      console.log('Available browse indices:', response.data?._embedded?.browses?.map(b => b.id))
      return response.data
    } catch (error) {
      console.error('Failed to get browse indices:', error.message)
      throw error
    }
  },

  /**
   * Check if value is a date range (e.g., "2020 - 2025" or "2020-2025")
   */
  isDateRange(value) {
    if (!value) return false
    // Match patterns like "2020 - 2025", "2020-2025", "2020 – 2025"
    const rangePattern = /^(\d{4})\s*[-–]\s*(\d{4})$/
    return rangePattern.test(value.trim())
  },

  /**
   * Parse date range string into start and end years
   */
  parseDateRange(value) {
    const rangePattern = /^(\d{4})\s*[-–]\s*(\d{4})$/
    const match = value.trim().match(rangePattern)
    if (match) {
      return {
        startYear: parseInt(match[1]),
        endYear: parseInt(match[2])
      }
    }
    return null
  },

  /**
   * Get items for a browse entry
   * @param {string} index - Browse index
   * @param {string} value - Entry value
   */
  async getItemsByEntry(index, value, params = {}) {
    console.log('getItemsByEntry called:', { index, value, params })

    // Special handling for date ranges
    if (index === 'dateissued' && this.isDateRange(value)) {
      return await this.getItemsByDateRange(value, params)
    }

    // Get possible index names for this browse type
    const indexNames = this.indexMappings[index] || [index]

    let lastError = null

    for (const indexName of indexNames) {
      try {
        const response = await api.get(`/discover/browses/${indexName}/items`, {
          params: {
            ...params,
            filterValue: value
          }
        })

        // Check if we got valid items
        const hasItems = response.data?._embedded?.items?.length > 0 ||
                        response.data?._embedded?.searchResult?._embedded?.objects?.length > 0

        if (hasItems || response.data?.page?.totalElements > 0) {
          return response.data
        }

        lastError = new Error('No items found')
      } catch (error) {
        lastError = error
        if (error.response?.status === 404) {
          continue
        }
        continue
      }
    }

    // If browse items endpoint fails, try search API as fallback
    return await this.searchItemsByFacet(index, value, params)
  },

  /**
   * Get items by date range using search API
   */
  async getItemsByDateRange(dateRange, params = {}) {
    const range = this.parseDateRange(dateRange)
    if (!range) {
      throw new Error('Invalid date range format')
    }

    console.log('Searching by date range:', range)

    try {
      // Build search URL with date range filter
      const queryParts = [
        'query=*',
        'dsoType=item',
        'embed=thumbnail'
      ]

      if (params.page !== undefined) queryParts.push(`page=${params.page}`)
      if (params.size !== undefined) queryParts.push(`size=${params.size}`)

      // Add date range filter - DSpace uses [YYYY TO YYYY] format
      queryParts.push(`f.dateIssued=[${range.startYear} TO ${range.endYear}],equals`)

      const queryString = queryParts.join('&')
      console.log('Date range search query:', queryString)

      const response = await api.get(`/discover/search/objects?${queryString}`)
      return response.data
    } catch (error) {
      console.error('Date range search failed:', error.message)

      // Try alternative approach with individual year filters
      try {
        const years = []
        for (let y = range.startYear; y <= range.endYear; y++) {
          years.push(y)
        }

        // Search for items in any of these years
        const searchParams = {
          query: '*',
          dsoType: 'item',
          page: params.page || 0,
          size: params.size || 12
        }

        const response = await api.get('/discover/search/objects', {
          params: searchParams
        })

        // Filter results client-side if needed
        return response.data
      } catch (altError) {
        console.error('Alternative date search failed:', altError.message)
        throw error
      }
    }
  },

  /**
   * Search items by facet value using search API
   */
  async searchItemsByFacet(index, value, params = {}) {
    console.log('Falling back to search API for browse items:', { index, value })

    const metadataField = this.getMetadataField(index)

    try {
      // Build query string manually
      const queryParts = [
        'query=*',
        'dsoType=item',
        'embed=thumbnail'
      ]

      if (params.page !== undefined) queryParts.push(`page=${params.page}`)
      if (params.size !== undefined) queryParts.push(`size=${params.size}`)

      // Add the facet filter with proper encoding
      queryParts.push(`f.${metadataField}=${encodeURIComponent(value)},equals`)

      const queryString = queryParts.join('&')
      console.log('Search query string:', queryString)

      const response = await api.get(`/discover/search/objects?${queryString}`)
      return response.data
    } catch (searchError) {
      console.error('Search fallback failed:', searchError.message)
      throw searchError
    }
  },

  /**
   * Get metadata field name for a browse type
   */
  getMetadataField(browseType) {
    const fieldMap = {
      'author': 'author',
      'subject': 'subject',
      'dateissued': 'dateIssued',
      'type': 'itemtype',
      'publisher': 'publisher',
      'title': 'title'
    }
    return fieldMap[browseType] || browseType
  }
}

// Statistics API
export const statistics = {
  /**
   * Get site statistics with caching
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async getSiteStats(useCache = true) {
    const cacheKey = 'site-stats'

    // Check cache first
    if (useCache) {
      const cached = statsCache.get(cacheKey)
      if (cached) {
        debugLog.log('Site stats cache hit')
        return cached
      }
    }

    try {
      const response = await api.get('/statistics/usagereports/search/object', {
        params: {
          uri: 'site'
        }
      })

      // Cache the response
      if (useCache) {
        statsCache.set(cacheKey, response.data)
      }

      return response.data
    } catch (error) {
      // Return default values if statistics endpoint is not available
      return {
        totalVisits: 0,
        totalDownloads: 0
      }
    }
  },

  /**
   * Get item statistics (views and downloads) with caching
   * @param {string} itemId - Item UUID
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async getItemStats(itemId, useCache = true) {
    if (!isValidUuid(itemId)) {
      return { views: 0, downloads: 0 }
    }

    const cacheKey = `item-stats:${itemId}`

    // Check cache first
    if (useCache) {
      const cached = statsCache.get(cacheKey)
      if (cached) {
        debugLog.log('Item stats cache hit:', itemId)
        return cached
      }
    }

    try {
      const response = await api.get('/statistics/usagereports/search/object', {
        params: {
          uri: `urn:dspace:item:${itemId}`
        }
      })

      // Parse the statistics response
      const reports = response.data._embedded?.usagereports || []
      let views = 0
      let downloads = 0

      reports.forEach(report => {
        if (report.reportType === 'TotalVisits') {
          views = report.points?.[0]?.values?.views || 0
        }
        if (report.reportType === 'TotalDownloads') {
          downloads = report.points?.[0]?.values?.downloads || 0
        }
      })

      const stats = { views, downloads }

      // Cache the response
      if (useCache) {
        statsCache.set(cacheKey, stats)
      }

      return stats
    } catch (error) {
      debugLog.error('Failed to get item statistics:', error)
      return { views: 0, downloads: 0 }
    }
  },

  /**
   * Get repository summary with caching
   * @param {boolean} useCache - Whether to use cache (default: true)
   */
  async getRepositorySummary(useCache = true) {
    const cacheKey = 'repository-summary'

    // Check cache first
    if (useCache) {
      const cached = statsCache.get(cacheKey)
      if (cached) {
        debugLog.log('Repository summary cache hit')
        return cached
      }
    }

    try {
      // Get counts from different endpoints
      const [communitiesRes, collectionsRes, itemsRes] = await Promise.all([
        api.get('/core/communities', { params: { size: 1 } }),
        api.get('/core/collections', { params: { size: 1 } }),
        api.get('/core/items', { params: { size: 1 } })
      ])

      const summary = {
        communities: communitiesRes.data.page?.totalElements || 0,
        collections: collectionsRes.data.page?.totalElements || 0,
        items: itemsRes.data.page?.totalElements || 0
      }

      // Cache the response
      if (useCache) {
        statsCache.set(cacheKey, summary)
      }

      return summary
    } catch (error) {
      debugLog.error('Failed to get repository summary:', error)
      return {
        communities: 0,
        collections: 0,
        items: 0
      }
    }
  },

  /**
   * Record a view event for an item (updates statistics)
   * @param {string} itemId - Item UUID
   */
  async recordItemView(itemId) {
    if (!isValidUuid(itemId)) {
      debugLog.error('Invalid item ID for view tracking:', itemId)
      return false
    }

    try {
      // DSpace 7+ uses POST to /statistics/viewevents to record views
      await api.post('/statistics/viewevents', {
        targetId: itemId,
        targetType: 'item'
      })

      debugLog.log('View recorded for item:', itemId)

      // Clear the cache for this item so next fetch gets updated count
      const cacheKey = `item-stats:${itemId}`
      statsCache.delete(cacheKey)

      return true
    } catch (error) {
      // Try alternative endpoint format for different DSpace versions
      try {
        await api.post('/statistics/viewevents', null, {
          params: {
            targetId: itemId,
            targetType: 'item'
          }
        })

        debugLog.log('View recorded for item (alt method):', itemId)
        const cacheKey = `item-stats:${itemId}`
        statsCache.delete(cacheKey)
        return true
      } catch (altError) {
        // Some DSpace configs don't expose this endpoint - silently fail
        debugLog.log('Could not record view (endpoint may not be available):', error.response?.status)
        return false
      }
    }
  },

  /**
   * Record a download event for a bitstream
   * @param {string} bitstreamId - Bitstream UUID
   */
  async recordDownload(bitstreamId) {
    if (!isValidUuid(bitstreamId)) {
      return false
    }

    try {
      await api.post('/statistics/viewevents', {
        targetId: bitstreamId,
        targetType: 'bitstream'
      })

      debugLog.log('Download recorded for bitstream:', bitstreamId)
      return true
    } catch (error) {
      debugLog.log('Could not record download:', error.response?.status)
      return false
    }
  },

  /**
   * Clear statistics cache
   */
  clearCache() {
    statsCache.clear()
    debugLog.log('Statistics cache cleared')
  }
}

// Utility functions
export const utils = {
  /**
   * Extract metadata value from item
   * @param {Object} metadata - Item metadata object
   * @param {string} field - Metadata field name
   * @param {boolean} multiple - Return array of values
   */
  getMetadataValue(metadata, field, multiple = false) {
    const values = metadata[field]
    if (!values || values.length === 0) {
      return multiple ? [] : null
    }
    return multiple ? values.map(v => v.value) : values[0].value
  },

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   */
  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  /**
   * Get thumbnail URL for an item from API response only
   * Returns null if no thumbnail is available (component should handle default)
   * @param {Object} item - Item object
   */
  getThumbnailUrl(item) {
    if (!item) return null

    // First check direct thumbnail link from _links (DSpace 7-9)
    if (item._links?.thumbnail?.href) {
      return item._links.thumbnail.href
    }

    // Check for thumbnail in indexableObject (search results wrapper)
    if (item.indexableObject?._links?.thumbnail?.href) {
      return item.indexableObject._links.thumbnail.href
    }

    // Check for thumbnail URL in metadata (some DSpace configurations)
    if (item.metadata?.['dc.identifier.thumbnail']?.[0]?.value) {
      return item.metadata['dc.identifier.thumbnail'][0].value
    }

    // Return null - don't construct URLs that might 404
    // Let the component handle the default image
    return null
  },

  /**
   * Get full item thumbnail URL (only use when you know thumbnail exists)
   * @param {string} itemId - Item UUID
   */
  getItemThumbnailUrl(itemId) {
    if (!itemId || !isValidUuid(itemId)) return null
    return `${api.defaults.baseURL}/core/items/${itemId}/thumbnail`
  }
}

// Cache Control - for managing all caches
export const cacheControl = {
  /**
   * Clear all caches
   */
  clearAll() {
    facetsCache.clear()
    searchCache.clear()
    itemCache.clear()
    statsCache.clear()
    debugLog.log('All caches cleared')
  },

  /**
   * Clear search-related caches
   */
  clearSearchCache() {
    searchCache.clear()
    facetsCache.clear()
    debugLog.log('Search caches cleared')
  },

  /**
   * Clear item-related caches
   */
  clearItemCache() {
    itemCache.clear()
    debugLog.log('Item cache cleared')
  },

  /**
   * Clear statistics cache
   */
  clearStatsCache() {
    statsCache.clear()
    debugLog.log('Stats cache cleared')
  },

  /**
   * Get cache status
   */
  getStatus() {
    return {
      facets: facetsCache.cache.size,
      search: searchCache.cache.size,
      items: itemCache.cache.size,
      stats: statsCache.cache.size
    }
  }
}

export default {
  communities,
  collections,
  items,
  bitstreams,
  search,
  browse,
  statistics,
  utils,
  cacheControl
}
