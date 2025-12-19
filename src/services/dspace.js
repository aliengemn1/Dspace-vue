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
  async getBundles(id) {
    validateId(id)
    const response = await api.get(`/core/items/${id}/bundles`)
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
  async getByBundle(bundleId) {
    validateId(bundleId)
    const response = await api.get(`/core/bundles/${bundleId}/bitstreams`)
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

    // Build URL search params to properly handle multiple facet values
    // DSpace expects: f.author=value1,equals&f.author=value2,equals
    const urlParams = new URLSearchParams()

    // Add query
    urlParams.append('query', sanitizedQuery)

    // Add dsoType
    urlParams.append('dsoType', params.dsoType || 'item')

    // Request thumbnail to be embedded in response (DSpace 7+)
    urlParams.append('embed', 'thumbnail')

    // Add pagination and sort params
    if (params.page !== undefined) urlParams.append('page', params.page)
    if (params.size !== undefined) urlParams.append('size', params.size)
    if (params.sort) urlParams.append('sort', params.sort)
    if (params.scope) urlParams.append('scope', params.scope)

    // Add facet filters - DSpace expects format: f.{facetName}={value},equals
    // Each value must be a separate parameter with the same key
    Object.entries(facets).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        values.forEach(v => {
          const sanitizedValue = typeof v === 'string' ? v : String(v)
          urlParams.append(`f.${key}`, `${sanitizedValue},equals`)
        })
      }
    })

    const queryString = urlParams.toString()
    debugLog.log('Search URL params:', queryString)

    // Check cache first
    if (useCache) {
      const cacheKey = searchCache.generateKey('search-facets', queryString)
      const cached = searchCache.get(cacheKey)
      if (cached) {
        debugLog.log('Search with facets cache hit')
        return cached
      }
    }

    // Make the request with the properly formatted query string
    const response = await api.get(`/discover/search/objects?${queryString}`)

    // Cache the response
    if (useCache) {
      const cacheKey = searchCache.generateKey('search-facets', queryString)
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
  /**
   * Browse by a specific index
   * @param {string} index - Browse index (author, title, dateissued, subject)
   */
  async byIndex(index, params = {}) {
    const response = await api.get(`/discover/browses/${index}/entries`, { params })
    return response.data
  },

  /**
   * Get browse indices
   */
  async getIndices() {
    const response = await api.get('/discover/browses')
    return response.data
  },

  /**
   * Get items for a browse entry
   * @param {string} index - Browse index
   * @param {string} value - Entry value
   */
  async getItemsByEntry(index, value, params = {}) {
    const response = await api.get(`/discover/browses/${index}/items`, {
      params: {
        ...params,
        filterValue: value
      }
    })
    return response.data
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
      // Return mock data if statistics endpoint is not available
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
