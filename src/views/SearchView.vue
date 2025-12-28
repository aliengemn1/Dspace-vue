<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SearchBox from '@/components/common/SearchBox.vue'
import ItemCard from '@/components/common/ItemCard.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import Pagination from '@/components/common/Pagination.vue'
import { search as searchApi, utils as dspaceUtils, collections as collectionsApi, communities as communitiesApi, cacheControl } from '@/services/dspace'
import { debugLog } from '@/utils/security'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const searchQuery = ref('')
const isLoading = ref(false)
const isLoadingFacets = ref(false)
const results = ref([])
const totalResults = ref(0)
const currentPage = ref(1)
const itemsPerPage = 12

// Advanced search mode
const showAdvancedSearch = ref(false)

// Simple search mode (contains, startsWith, exact)
const searchMode = ref('contains')

// Advanced search with multiple fields and boolean operators
// Default to General (keyword) and Author fields
const advancedRows = ref([
  { field: 'keyword', value: '', operator: 'AND' },
  { field: 'author', value: '', operator: 'AND' }
])

// Legacy single fields for basic advanced search
const advancedFields = ref({
  keyword: '',
  title: '',
  author: '',
  subject: '',
  dateFrom: '',
  dateTo: '',
  abstract: '',
  identifier: ''
})

// Field options for advanced search - includes all DSpace 9 metadata fields
const fieldOptions = [
  { id: 'keyword', field: '*', label: 'search.advancedFields.keyword' },
  { id: 'title', field: 'dc.title', label: 'search.advancedFields.title' },
  { id: 'author', field: 'dc.contributor.author', label: 'search.advancedFields.author' },
  { id: 'subject', field: 'dc.subject', label: 'search.advancedFields.subject' },
  { id: 'abstract', field: 'dc.description.abstract', label: 'search.advancedFields.abstract' },
  { id: 'identifier', field: 'dc.identifier', label: 'search.advancedFields.identifier' },
  { id: 'type', field: 'dc.type', label: 'search.advancedFields.type' },
  { id: 'language', field: 'dc.language.iso', label: 'search.advancedFields.language' },
  { id: 'publisher', field: 'dc.publisher', label: 'search.advancedFields.publisher' }
]

// Boolean operators
const booleanOperators = ['AND', 'OR', 'NOT']

// Collection and Community filters for advanced search
const selectedCollection = ref('')
const selectedCommunity = ref('')
const availableCollections = ref([])
const availableCommunities = ref([])

const sortOptions = [
  { value: 'relevance', label: t('search.relevance') },
  { value: 'date_desc', label: t('search.dateNewest') },
  { value: 'date_asc', label: t('search.dateOldest') },
  { value: 'title_asc', label: t('search.titleAZ') },
  { value: 'title_desc', label: t('search.titleZA') }
]

const selectedSort = ref('relevance')
const showFilters = ref(false)
const viewMode = ref('grid') // 'grid' or 'list'
const selectedCategory = ref('general')
const selectedSearchField = ref('*') // DSpace metadata field for search
// Selected filters - dynamic based on available facets
const selectedFilters = ref({})

// Flag to prevent watcher from triggering search during programmatic navigation
const isNavigatingProgrammatically = ref(false)

// Counter to track navigation operations and prevent race conditions
const navigationCounter = ref(0)

// Facets from DSpace API - will be populated dynamically
const availableFacets = ref({})

// Track expanded/collapsed state for each facet
const expandedFacets = ref({})

// Default number of items to show when collapsed
const FACET_COLLAPSED_COUNT = 5

// Facet configuration - maps DSpace facet names to display labels
const facetLabels = {
  'author': { ar: 'المؤلف', en: 'Author' },
  'subject': { ar: 'الموضوع', en: 'Subject' },
  'dateIssued': { ar: 'تاريخ النشر', en: 'Date Issued' },
  'itemtype': { ar: 'نوع المادة', en: 'Item Type' },
  'has_content_in_original_bundle': { ar: 'يحتوي على ملفات', en: 'Has Files' },
  'entityType': { ar: 'نوع الكيان', en: 'Entity Type' }
}

const totalPages = computed(() => Math.ceil(totalResults.value / itemsPerPage))

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.search'), path: '/search' }
])

function handleSearch(query, category, field) {
  searchQuery.value = query
  if (category) {
    selectedCategory.value = category
  }
  if (field) {
    selectedSearchField.value = field
  }
  currentPage.value = 1
  performSearch()
  router.push({ query: { q: query, page: 1, category: selectedCategory.value, field: selectedSearchField.value } })
}

function handleCategoryChange(category, field) {
  selectedCategory.value = category
  if (field) {
    selectedSearchField.value = field
  }
  if (searchQuery.value) {
    performSearch()
    router.push({ query: { ...route.query, category, field: selectedSearchField.value } })
  }
}

function setViewMode(mode) {
  viewMode.value = mode
}

// Map sort value to DSpace sort parameter
function getSortParam(sortValue) {
  const sortMap = {
    'relevance': 'score,DESC',
    'date_desc': 'dc.date.issued,DESC',
    'date_asc': 'dc.date.issued,ASC',
    'title_asc': 'dc.title,ASC',
    'title_desc': 'dc.title,DESC'
  }
  return sortMap[sortValue] || 'score,DESC'
}

// Get facet label based on locale
function getFacetLabel(facetName) {
  const labels = facetLabels[facetName]
  if (labels) {
    return locale.value === 'ar' ? labels.ar : labels.en
  }
  // Return the facet name with first letter capitalized as fallback
  return facetName.charAt(0).toUpperCase() + facetName.slice(1)
}

// Load collections for advanced search filter
// If communityId is provided, load only collections for that community
async function loadCollections(communityId = null) {
  try {
    let response
    if (communityId) {
      // Load collections for specific community
      response = await communitiesApi.getCollections(communityId, { size: 100 })
    } else {
      // Load all collections
      response = await collectionsApi.getAll({ size: 100 })
    }

    if (response._embedded?.collections) {
      availableCollections.value = response._embedded.collections.map(c => ({
        id: c.uuid || c.id,
        name: c.name || dspaceUtils.getMetadataValue(c.metadata, 'dc.title') || 'Unnamed'
      }))
    } else {
      availableCollections.value = []
    }
    debugLog.log('Loaded collections:', availableCollections.value.length, 'for community:', communityId || 'all')
  } catch (error) {
    debugLog.error('Failed to load collections:', error)
    availableCollections.value = []
  }
}

// Load communities for advanced search filter
async function loadCommunities() {
  try {
    const response = await communitiesApi.getAll({ size: 100 })
    if (response._embedded?.communities) {
      availableCommunities.value = response._embedded.communities.map(c => ({
        id: c.uuid || c.id,
        name: c.name || dspaceUtils.getMetadataValue(c.metadata, 'dc.title') || 'Unnamed'
      }))
    }
    debugLog.log('Loaded communities:', availableCommunities.value)
  } catch (error) {
    debugLog.error('Failed to load communities:', error)
  }
}

// Process facets from API response
function processFacetsFromResponse(response) {
  if (!response._embedded?.facets) {
    return
  }

  const newFacets = {}

  response._embedded.facets.forEach(facet => {
    // Get facet values from embedded values
    let values = []

    if (facet._embedded?.values && facet._embedded.values.length > 0) {
      values = facet._embedded.values
    }

    if (values.length > 0) {
      newFacets[facet.name] = {
        name: facet.name,
        label: getFacetLabel(facet.name),
        values: values.map(v => ({
          label: v.label || v.value,
          value: v.value,
          count: v.count || 0
        }))
      }
    }
  })

  availableFacets.value = newFacets
  debugLog.log('Processed facets:', availableFacets.value)
}

// Load initial facets by doing a search with all items
async function loadInitialFacets() {
  isLoadingFacets.value = true
  try {
    // Do a search with wildcard to get facet values
    const response = await searchApi.searchWithFacets('*', {}, {
      page: 0,
      size: 1 // We only need facets, not results
    })

    debugLog.log('Initial facets response:', response)
    processFacetsFromResponse(response)
  } catch (error) {
    debugLog.error('Failed to load initial facets:', error)
  } finally {
    isLoadingFacets.value = false
  }
}

// Transform DSpace item to display format
function transformItem(dspaceItem, wrapperObj = null) {
  const metadata = dspaceItem.metadata || {}
  const itemId = dspaceItem.uuid || dspaceItem.id

  // Get thumbnail URL from API response
  // DSpace can return thumbnail in multiple locations depending on API version and embed param
  let thumbnailUrl = null

  // 1. Check embedded thumbnail (when using embed=thumbnail parameter)
  if (dspaceItem._embedded?.thumbnail?._links?.content?.href) {
    thumbnailUrl = dspaceItem._embedded.thumbnail._links.content.href
  }
  // 2. Check item's direct thumbnail link
  else if (dspaceItem._links?.thumbnail?.href) {
    thumbnailUrl = dspaceItem._links.thumbnail.href
  }
  // 3. Check wrapper object's embedded thumbnail
  else if (wrapperObj?._embedded?.thumbnail?._links?.content?.href) {
    thumbnailUrl = wrapperObj._embedded.thumbnail._links.content.href
  }
  // 4. Check wrapper object's thumbnail link
  else if (wrapperObj?._links?.thumbnail?.href) {
    thumbnailUrl = wrapperObj._links.thumbnail.href
  }
  // 5. Check indexableObject's thumbnail (for nested structures)
  else if (wrapperObj?._embedded?.indexableObject?._embedded?.thumbnail?._links?.content?.href) {
    thumbnailUrl = wrapperObj._embedded.indexableObject._embedded.thumbnail._links.content.href
  }
  else if (wrapperObj?._embedded?.indexableObject?._links?.thumbnail?.href) {
    thumbnailUrl = wrapperObj._embedded.indexableObject._links.thumbnail.href
  }

  // If no thumbnail from API, ItemCard will show default image

  return {
    id: itemId,
    title: dspaceUtils.getMetadataValue(metadata, 'dc.title') || 'بدون عنوان',
    author: dspaceUtils.getMetadataValue(metadata, 'dc.contributor.author') ||
            dspaceUtils.getMetadataValue(metadata, 'dc.creator') || 'غير معروف',
    date: dspaceUtils.getMetadataValue(metadata, 'dc.date.issued') || '',
    type: dspaceUtils.getMetadataValue(metadata, 'dc.type') || 'غير محدد',
    collection: dspaceUtils.getMetadataValue(metadata, 'dc.relation.ispartof') || '',
    thumbnail: thumbnailUrl,
    abstract: dspaceUtils.getMetadataValue(metadata, 'dc.description.abstract')
  }
}

// Apply search mode to query (contains, startsWith, exact)
function applySearchMode(query, mode) {
  if (!query) return query
  switch (mode) {
    case 'startsWith':
      return `${query}*`
    case 'exact':
      return `"${query}"`
    case 'contains':
    default:
      return `*${query}*`
  }
}

async function performSearch() {
  console.log('=== PERFORM SEARCH CALLED ===')

  const query = searchQuery.value.trim()
  const hasFilters = Object.keys(selectedFilters.value).length > 0

  console.log('Query:', query)
  console.log('Has filters:', hasFilters)
  console.log('Selected filters:', JSON.stringify(selectedFilters.value))

  // Only return early if no query AND no filters selected
  if (!query && !hasFilters) {
    console.log('No query and no filters - returning early')
    results.value = []
    totalResults.value = 0
    return
  }

  isLoading.value = true
  isLoadingFacets.value = true

  try {
    // Build facet filters for the API
    const facetFilters = {}
    Object.entries(selectedFilters.value).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        facetFilters[key] = values
      }
    })

    console.log('Facet filters to send:', JSON.stringify(facetFilters))

    // Build query with field-specific search and search mode
    // Use '*' (all items) if no query but filters are selected
    let queryString = query || '*'

    // Apply search mode for simple search (only if there's a query)
    if (query && !showAdvancedSearch.value && searchMode.value !== 'contains') {
      queryString = applySearchMode(query, searchMode.value)
    }

    if (query && selectedSearchField.value && selectedSearchField.value !== '*') {
      // Use DSpace field-specific query syntax
      queryString = `${selectedSearchField.value}:${queryString}`
    } else if (query && selectedSearchField.value === '*') {
      // For general search, search across multiple important fields including abstract
      // This ensures abstract content is included in search results
      const escapedQuery = query.replace(/['"]/g, '\\"')
      queryString = `(dc.title:"${escapedQuery}" OR dc.contributor.author:"${escapedQuery}" OR dc.subject:"${escapedQuery}" OR dc.description.abstract:"${escapedQuery}" OR dc.description:"${escapedQuery}" OR dc.publisher:"${escapedQuery}" OR "${escapedQuery}")`
    }

    // Call DSpace search API with facets
    // Disable cache when filters are active to ensure fresh results
    const response = await searchApi.searchWithFacets(
      queryString,
      facetFilters,
      {
        page: currentPage.value - 1, // DSpace uses 0-based pages
        size: itemsPerPage,
        sort: getSortParam(selectedSort.value)
      },
      !hasFilters // Use cache only when no filters are selected
    )

    // Process search results
    if (response._embedded?.searchResult?._embedded?.objects) {
      results.value = response._embedded.searchResult._embedded.objects
        .filter(obj => obj._embedded?.indexableObject)
        .map(obj => transformItem(obj._embedded.indexableObject, obj))
    } else {
      results.value = []
    }

    // Update total results count
    totalResults.value = response._embedded?.searchResult?.page?.totalElements ||
                         response.page?.totalElements || 0

    // Update available facets from search response
    processFacetsFromResponse(response)

  } catch (error) {
    debugLog.error('Search failed:', error)
    results.value = []
    totalResults.value = 0
  } finally {
    isLoading.value = false
    isLoadingFacets.value = false
  }
}

function handlePageChange(page) {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  performSearch()
}

function handleSortChange(event) {
  selectedSort.value = event.target.value
  currentPage.value = 1
  performSearch()
}

async function toggleFilter(facetName, value) {
  console.log('=== TOGGLE FILTER CALLED ===')
  console.log('Facet:', facetName, 'Value:', value)

  // Single selection mode - selecting one value clears others in same facet
  const currentValue = selectedFilters.value[facetName]?.[0]

  // Create a new object to ensure Vue reactivity triggers
  const newFilters = { ...selectedFilters.value }

  if (currentValue === value) {
    // Clicking same value deselects it
    delete newFilters[facetName]
    console.log('Filter DESELECTED:', facetName, value)
  } else {
    // Select new value (replaces any previous selection in this facet)
    newFilters[facetName] = [value]
    console.log('Filter SELECTED:', facetName, value)
  }

  // Assign new object to trigger reactivity
  selectedFilters.value = newFilters
  currentPage.value = 1

  console.log('New filters object:', JSON.stringify(selectedFilters.value))

  // Clear search cache to ensure fresh results with filters
  cacheControl.clearSearchCache()

  // Increment counter and set flag to prevent watcher interference
  navigationCounter.value++
  const currentNavigation = navigationCounter.value
  isNavigatingProgrammatically.value = true

  // Update URL with filter parameters (like DSpace Angular)
  // Use replace instead of push to avoid adding to history for each filter change
  const query = { ...route.query }

  // Remove old filter params
  Object.keys(query).forEach(key => {
    if (key.startsWith('f.')) {
      delete query[key]
    }
  })

  // Add current filters to URL params
  Object.entries(selectedFilters.value).forEach(([fname, vals]) => {
    if (Array.isArray(vals) && vals.length > 0) {
      query[`f.${fname}`] = vals.map(v => `${v},equals`)
    }
  })

  query.page = '1'

  // Trigger search FIRST with current filters before URL update
  // This ensures the search uses the correct selectedFilters.value
  console.log('Calling performSearch with filters:', JSON.stringify(selectedFilters.value))
  await performSearch()

  // Then update URL (watcher will be skipped due to flag)
  try {
    await router.replace({ query })
  } catch (err) {
    // Ignore navigation duplicated errors
    if (err.name !== 'NavigationDuplicated') {
      console.error('Router replace error:', err)
    }
  }

  // Reset flag only if this is still the current navigation
  if (currentNavigation === navigationCounter.value) {
    isNavigatingProgrammatically.value = false
  }
}

// Update URL with current filters (DSpace Angular style)
function updateUrlWithFilters() {
  const query = { ...route.query }

  // Remove old filter params
  Object.keys(query).forEach(key => {
    if (key.startsWith('f.')) {
      delete query[key]
    }
  })

  // Add current filters to URL params
  Object.entries(selectedFilters.value).forEach(([facetName, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      // DSpace format: f.facetName=value,equals
      query[`f.${facetName}`] = values.map(v => `${v},equals`)
    }
  })

  // Update current page
  query.page = '1'

  // Navigate to new URL with filters
  router.push({ query })
}

async function clearFilters() {
  selectedFilters.value = {}
  currentPage.value = 1
  cacheControl.clearSearchCache()

  // Increment counter and set flag to prevent watcher interference
  navigationCounter.value++
  const currentNavigation = navigationCounter.value
  isNavigatingProgrammatically.value = true

  // Trigger search FIRST with cleared filters
  await performSearch()

  // Remove filter params from URL
  const query = { ...route.query }
  Object.keys(query).forEach(key => {
    if (key.startsWith('f.')) {
      delete query[key]
    }
  })
  query.page = '1'

  try {
    await router.replace({ query })
  } catch (err) {
    if (err.name !== 'NavigationDuplicated') {
      console.error('Router replace error:', err)
    }
  }

  // Reset flag only if this is still the current navigation
  if (currentNavigation === navigationCounter.value) {
    isNavigatingProgrammatically.value = false
  }
}

// Load filters from URL query params (on page load or URL change)
function loadFiltersFromUrl() {
  const newFilters = {}

  // Parse f.* parameters from URL
  Object.entries(route.query).forEach(([key, value]) => {
    if (key.startsWith('f.')) {
      const facetName = key.substring(2) // Remove 'f.' prefix
      const values = Array.isArray(value) ? value : [value]

      // Extract value without operator (e.g., "Smith,equals" -> "Smith")
      newFilters[facetName] = values.map(v => {
        const parts = v.split(',')
        // Remove the operator part (last part)
        return parts.slice(0, -1).join(',') || parts[0]
      })
    }
  })

  selectedFilters.value = newFilters
  debugLog.log('Filters loaded from URL:', newFilters)
}

// Toggle facet expand/collapse
function toggleFacetExpand(facetName) {
  expandedFacets.value[facetName] = !expandedFacets.value[facetName]
}

// Check if facet is expanded
function isFacetExpanded(facetName) {
  return expandedFacets.value[facetName] === true
}

// Get visible facet values (collapsed or expanded)
function getVisibleFacetValues(facet, facetName) {
  if (isFacetExpanded(facetName)) {
    return facet.values
  }
  return facet.values.slice(0, FACET_COLLAPSED_COUNT)
}

// Get count of selected filters for a facet
function getSelectedCount(facetName) {
  return selectedFilters.value[facetName]?.length || 0
}

// Check if a filter value is selected
function isFilterSelected(facetName, value) {
  return selectedFilters.value[facetName]?.includes(value) || false
}

// Clear advanced search fields
function clearAdvancedFields() {
  advancedFields.value = {
    keyword: '',
    title: '',
    author: '',
    subject: '',
    dateFrom: '',
    dateTo: '',
    abstract: '',
    identifier: ''
  }
  // Reset advanced rows to defaults (General and Author)
  advancedRows.value = [
    { field: 'keyword', value: '', operator: 'AND' },
    { field: 'author', value: '', operator: 'AND' }
  ]
  // Reset scope filters
  selectedCollection.value = ''
  selectedCommunity.value = ''
}

// Add new advanced search row
function addAdvancedRow() {
  advancedRows.value.push({ field: 'keyword', value: '', operator: 'AND' })
}

// Remove advanced search row
function removeAdvancedRow(index) {
  if (advancedRows.value.length > 1) {
    advancedRows.value.splice(index, 1)
  }
}

// Get DSpace field from field id
function getDSpaceField(fieldId) {
  const option = fieldOptions.find(f => f.id === fieldId)
  return option ? option.field : '*'
}

// Perform advanced search with boolean operators
function performAdvancedSearch() {
  // Build query from advanced rows with boolean operators
  const validRows = advancedRows.value.filter(row => row.value.trim())

  if (validRows.length === 0) {
    return
  }

  let queryString = ''
  validRows.forEach((row, index) => {
    const field = getDSpaceField(row.field)
    const value = row.value.trim()

    let term = ''
    if (field === '*') {
      term = value
    } else {
      term = `${field}:${value}`
    }

    if (index === 0) {
      queryString = term
    } else {
      // Apply boolean operator
      queryString = `${queryString} ${row.operator} ${term}`
    }
  })

  // Add date range if specified
  if (advancedFields.value.dateFrom || advancedFields.value.dateTo) {
    const from = advancedFields.value.dateFrom || '*'
    const to = advancedFields.value.dateTo || '*'
    const dateQuery = `dc.date.issued:[${from} TO ${to}]`
    queryString = queryString ? `${queryString} AND ${dateQuery}` : dateQuery
  }

  searchQuery.value = queryString
  selectedSearchField.value = '*' // Use combined query
  currentPage.value = 1

  // Build URL query with scope filters
  const urlQuery = {
    q: searchQuery.value,
    page: 1,
    advanced: 'true'
  }

  // Add collection/community scope to URL and search
  if (selectedCollection.value) {
    urlQuery.scope = selectedCollection.value
  } else if (selectedCommunity.value) {
    urlQuery.scope = selectedCommunity.value
  }

  performSearchWithScope()

  // Update URL
  router.push({ query: urlQuery })
}

// Perform search with collection/community scope
async function performSearchWithScope() {
  const query = searchQuery.value.trim()
  if (!query) {
    results.value = []
    totalResults.value = 0
    return
  }

  isLoading.value = true

  try {
    // Build facet filters for the API
    const facetFilters = {}
    Object.entries(selectedFilters.value).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        facetFilters[key] = values
      }
    })

    // Build search params with scope
    const searchParams = {
      page: currentPage.value - 1,
      size: itemsPerPage,
      sort: getSortParam(selectedSort.value)
    }

    // Add scope (collection or community) - DSpace uses 'scope' parameter
    if (selectedCollection.value) {
      searchParams.scope = selectedCollection.value
    } else if (selectedCommunity.value) {
      searchParams.scope = selectedCommunity.value
    }

    // Call DSpace search API with facets and scope
    const response = await searchApi.searchWithFacets(
      searchQuery.value,
      facetFilters,
      searchParams
    )

    // Process search results
    if (response._embedded?.searchResult?._embedded?.objects) {
      results.value = response._embedded.searchResult._embedded.objects
        .filter(obj => obj._embedded?.indexableObject)
        .map(obj => transformItem(obj._embedded.indexableObject, obj))
    } else {
      results.value = []
    }

    // Update total results count
    totalResults.value = response._embedded?.searchResult?.page?.totalElements ||
                         response.page?.totalElements || 0

    // Update available facets from search response
    processFacetsFromResponse(response)

  } catch (error) {
    debugLog.error('Search failed:', error)
    results.value = []
    totalResults.value = 0
  } finally {
    isLoading.value = false
  }
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return Object.values(selectedFilters.value).some(
    filters => Array.isArray(filters) && filters.length > 0
  )
})

onMounted(async () => {
  // Load collections and communities for advanced search
  await Promise.all([
    loadCollections(),
    loadCommunities()
  ])

  // Set search query from URL or default to * (all items)
  if (route.query.q) {
    searchQuery.value = route.query.q
  } else {
    // Default to wildcard search to show all items
    searchQuery.value = '*'
  }

  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
  if (route.query.field) {
    selectedSearchField.value = route.query.field
  }
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page)
  }

  // Load filters from URL (DSpace Angular style f.author=value,equals)
  loadFiltersFromUrl()

  // Always perform search (with * if no query provided)
  performSearch()
})

watch(() => route.query, (newQuery, oldQuery) => {
  // Skip if we're navigating programmatically (from toggleFilter or clearFilters)
  if (isNavigatingProgrammatically.value) {
    console.log('Skipping watcher - programmatic navigation')
    return
  }

  // Check if the query or field changed (not just filters)
  const queryChanged = newQuery.q !== (oldQuery?.q || '')
  const fieldChanged = newQuery.field !== (oldQuery?.field || '')

  // Check if filter params changed
  const newFilterKeys = Object.keys(newQuery).filter(k => k.startsWith('f.'))
  const oldFilterKeys = Object.keys(oldQuery || {}).filter(k => k.startsWith('f.'))
  const filterChanged = newFilterKeys.length !== oldFilterKeys.length ||
                        newFilterKeys.some(k => newQuery[k] !== oldQuery?.[k])

  // Only proceed if something actually changed
  if (!queryChanged && !fieldChanged && !filterChanged) {
    console.log('Skipping watcher - no relevant changes')
    return
  }

  console.log('Watcher triggered - query:', queryChanged, 'field:', fieldChanged, 'filter:', filterChanged)

  if (newQuery.q !== searchQuery.value) {
    searchQuery.value = newQuery.q || '*'
  }
  if (newQuery.field) {
    selectedSearchField.value = newQuery.field
  }

  // Load filters from URL if filter params changed (external navigation like back/forward)
  if (filterChanged) {
    loadFiltersFromUrl()
  }

  // Perform search with updated parameters
  performSearch()
}, { deep: true })

// Watch for community selection changes to load related collections
watch(selectedCommunity, (newCommunityId) => {
  // Clear selected collection when community changes
  selectedCollection.value = ''

  // Load collections for the selected community, or all collections if none selected
  loadCollections(newCommunityId || null)
})
</script>

<template>
  <div class="search-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Search Header -->
    <div class="search-header">
      <div class="container">
        <h1 class="page-title">{{ $t('search.results') }}</h1>

        <!-- Search Mode Toggle -->
        <div class="search-mode-toggle">
          <button
            class="mode-btn"
            :class="{ 'active': !showAdvancedSearch }"
            @click="showAdvancedSearch = false"
          >
            {{ $t('search.simpleSearch') }}
          </button>
          <button
            class="mode-btn"
            :class="{ 'active': showAdvancedSearch }"
            @click="showAdvancedSearch = true"
          >
            {{ $t('search.advancedSearch') }}
          </button>
        </div>

        <!-- Simple Search -->
        <div v-if="!showAdvancedSearch" class="simple-search-wrapper">
          <div class="search-box-wrapper">
            <SearchBox
              v-model="searchQuery"
              :placeholder="$t('search.placeholder')"
              :show-advanced="false"
              :show-categories="true"
              :show-voice-search="true"
              @search="handleSearch"
              @category-change="handleCategoryChange"
            />
          </div>
          <!-- Search Mode Options -->
          <div class="search-mode-options">
            <span class="search-mode-label">{{ $t('search.searchMode.label') }}:</span>
            <label class="search-mode-option">
              <input type="radio" v-model="searchMode" value="contains" />
              <span>{{ $t('search.searchMode.contains') }}</span>
            </label>
            <label class="search-mode-option">
              <input type="radio" v-model="searchMode" value="startsWith" />
              <span>{{ $t('search.searchMode.startsWith') }}</span>
            </label>
            <label class="search-mode-option">
              <input type="radio" v-model="searchMode" value="exact" />
              <span>{{ $t('search.searchMode.exact') }}</span>
            </label>
          </div>
        </div>

        <!-- Advanced Search Form -->
        <div v-else class="advanced-search-form">
          <!-- Dynamic Search Rows with Boolean Operators -->
          <div class="advanced-rows">
            <div
              v-for="(row, index) in advancedRows"
              :key="index"
              class="advanced-row"
            >
              <!-- Boolean Operator (not shown for first row) -->
              <div v-if="index > 0" class="row-operator">
                <select v-model="row.operator" class="operator-select">
                  <option v-for="op in booleanOperators" :key="op" :value="op">
                    {{ $t(`search.advancedFields.${op.toLowerCase()}`) }}
                  </option>
                </select>
              </div>
              <div v-else class="row-operator-placeholder"></div>

              <!-- Field Select -->
              <div class="row-field">
                <select v-model="row.field" class="field-select">
                  <option v-for="opt in fieldOptions" :key="opt.id" :value="opt.id">
                    {{ $t(opt.label) }}
                  </option>
                </select>
              </div>

              <!-- Value Input -->
              <div class="row-value">
                <input
                  v-model="row.value"
                  type="text"
                  class="form-input"
                  :placeholder="$t('search.advancedFields.anyField')"
                />
              </div>

              <!-- Remove Button -->
              <button
                v-if="advancedRows.length > 1"
                type="button"
                class="row-remove-btn"
                @click="removeAdvancedRow(index)"
                :aria-label="$t('search.advancedFields.removeField')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div v-else class="row-remove-placeholder"></div>
            </div>

            <!-- Add Row Button -->
            <button type="button" class="add-row-btn" @click="addAdvancedRow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {{ $t('search.advancedFields.addField') }}
            </button>
          </div>

          <!-- Date Range Section -->
          <div class="date-range-section">
            <h4 class="section-title">{{ $t('search.filterBy.date') || (locale === 'ar' ? 'تاريخ النشر' : 'Date Issued') }}</h4>
            <div class="date-range-inputs">
              <!-- Date From -->
              <div class="form-group">
                <label class="form-label">{{ $t('search.advancedFields.dateFrom') || (locale === 'ar' ? 'من' : 'From') }}</label>
                <input
                  v-model="advancedFields.dateFrom"
                  type="date"
                  class="form-input"
                />
              </div>

              <!-- Date To -->
              <div class="form-group">
                <label class="form-label">{{ $t('search.advancedFields.dateTo') || (locale === 'ar' ? 'إلى' : 'To') }}</label>
                <input
                  v-model="advancedFields.dateTo"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Scope Filters (Collection & Community) -->
          <div class="scope-filters-section">
            <h4 class="section-title">{{ $t('search.searchScope') }}</h4>
            <div class="scope-filters-grid">
              <!-- Community Filter -->
              <div class="form-group">
                <label class="form-label">{{ $t('search.filterBy.community') }}</label>
                <select v-model="selectedCommunity" class="form-select">
                  <option value="">{{ $t('search.allCommunities') }}</option>
                  <option v-for="comm in availableCommunities" :key="comm.id" :value="comm.id">
                    {{ comm.name }}
                  </option>
                </select>
              </div>

              <!-- Collection Filter -->
              <div class="form-group">
                <label class="form-label">{{ $t('search.filterBy.collection') }}</label>
                <select v-model="selectedCollection" class="form-select">
                  <option value="">{{ $t('search.allCollections') }}</option>
                  <option v-for="coll in availableCollections" :key="coll.id" :value="coll.id">
                    {{ coll.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Advanced Search Actions -->
          <div class="advanced-search-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="clearAdvancedFields"
            >
              {{ $t('search.advancedFields.clearButton') }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="performAdvancedSearch"
            >
              {{ $t('search.advancedFields.searchButton') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="search-content">
      <div class="container">
        <div class="search-layout">
          <!-- Filters Sidebar -->
          <aside class="filters-sidebar" :class="{ 'is-open': showFilters }">
            <div class="filters-header">
              <h2 class="filters-title">{{ $t('search.filters') }}</h2>
              <button
                v-if="hasActiveFilters"
                class="clear-filters-btn"
                @click="clearFilters"
              >
                {{ $t('common.clear') }}
              </button>
            </div>

            <!-- Filter Groups - Dynamic from DSpace API -->
            <template v-for="(facet, facetName) in availableFacets" :key="facetName">
              <div v-if="facet.values && facet.values.length > 0" class="filter-group">
                <div class="filter-group-header">
                  <h3 class="filter-group-title">{{ facet.label }}</h3>
                  <div class="filter-group-badges">
                    <span v-if="getSelectedCount(facetName) > 0" class="selected-count">
                      {{ getSelectedCount(facetName) }}
                    </span>
                    <span class="filter-group-count">({{ facet.values.length }})</span>
                  </div>
                </div>
                <div class="filter-options">
                  <div
                    v-for="facetValue in getVisibleFacetValues(facet, facetName)"
                    :key="facetValue.value"
                    class="filter-option"
                    :class="{ 'is-selected': isFilterSelected(facetName, facetValue.value) }"
                    @click="toggleFilter(facetName, facetValue.value)"
                    role="button"
                    tabindex="0"
                    @keydown.enter="toggleFilter(facetName, facetValue.value)"
                    @keydown.space.prevent="toggleFilter(facetName, facetValue.value)"
                  >
                    <span class="filter-radio" :class="{ 'checked': isFilterSelected(facetName, facetValue.value) }"></span>
                    <span class="filter-label">{{ facetValue.label }}</span>
                    <span class="filter-count">({{ facetValue.count }})</span>
                  </div>
                </div>
                <!-- Expand/Collapse Button - Always show for all facets -->
                <div class="facet-toggle-wrapper">
                  <button
                    v-if="facet.values.length > FACET_COLLAPSED_COUNT"
                    class="facet-toggle-btn"
                    @click="toggleFacetExpand(facetName)"
                  >
                    <span v-if="isFacetExpanded(facetName)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      {{ $t('search.showLess') }}
                    </span>
                    <span v-else>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      {{ $t('search.showMore', { count: facet.values.length - FACET_COLLAPSED_COUNT }) }}
                    </span>
                  </button>
                  <!-- Show item count for facets with few items -->
                  <span v-else class="facet-items-info">
                    {{ $t('search.itemsCount', { count: facet.values.length }) }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Loading Facets State -->
            <div v-if="isLoadingFacets" class="facets-loading">
              <div class="spinner-small"></div>
              <span>{{ $t('common.loading') }}</span>
            </div>

            <!-- No Facets Available -->
            <div v-if="!isLoadingFacets && Object.keys(availableFacets).length === 0" class="no-facets">
              <p>{{ $t('search.noFiltersAvailable') || 'ابحث للحصول على خيارات التصفية' }}</p>
            </div>
          </aside>

          <!-- Results Area -->
          <main class="results-area">
            <!-- Results Header -->
            <div class="results-header">
              <div class="results-info">
                <button
                  class="filter-toggle hide-lg-up"
                  @click="showFilters = !showFilters"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                  {{ $t('search.filters') }}
                </button>
                <span v-if="totalResults > 0" class="results-count">
                  {{ $t('search.resultsCount', { count: totalResults }) }}
                </span>
              </div>
              <div class="results-controls">
                <!-- View Mode Toggle -->
                <div class="view-toggle">
                  <button
                    class="view-btn"
                    :class="{ 'active': viewMode === 'grid' }"
                    @click="setViewMode('grid')"
                    :aria-label="$t('search.viewGrid') || 'Grid view'"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </button>
                  <button
                    class="view-btn"
                    :class="{ 'active': viewMode === 'list' }"
                    @click="setViewMode('list')"
                    :aria-label="$t('search.viewList') || 'List view'"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </button>
                </div>

                <!-- Sort Dropdown -->
                <div class="sort-wrapper">
                  <label for="sort-select" class="sort-label">{{ $t('search.sortBy') }}:</label>
                  <select
                    id="sort-select"
                    class="sort-select"
                    :value="selectedSort"
                    @change="handleSortChange"
                  >
                    <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Active Filters Display -->
            <div v-if="hasActiveFilters" class="active-filters">
              <span class="active-filters-label">{{ $t('search.activeFilters') }}</span>
              <div class="active-filters-list">
                <template v-for="(values, facetName) in selectedFilters" :key="facetName">
                  <button
                    v-for="value in values"
                    :key="`${facetName}-${value}`"
                    class="active-filter-chip"
                    @click="toggleFilter(facetName, value)"
                  >
                    <span class="chip-facet">{{ getFacetLabel(facetName) }}:</span>
                    <span class="chip-value">{{ value }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </template>
              </div>
              <button class="clear-all-filters-btn" @click="clearFilters">
                {{ $t('search.clearAll') }}
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="results-loading">
              <div class="spinner"></div>
              <span>{{ $t('common.loading') }}</span>
            </div>

            <!-- No Results -->
            <div v-else-if="searchQuery && results.length === 0" class="no-results">
              <div class="no-results-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
              <h3 class="no-results-title">{{ $t('search.noResults') }}</h3>
              <p class="no-results-description">{{ $t('search.noResultsDescription') }}</p>
            </div>

            <!-- Results Grid/List -->
            <div v-else-if="results.length > 0" class="results-container" :class="[`view-${viewMode}`]">
              <ItemCard
                v-for="item in results"
                :key="item.id"
                :item="item"
                :compact="viewMode === 'list'"
              />
            </div>

            <!-- Initial State -->
            <div v-else class="search-initial">
              <div class="initial-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p class="initial-text">{{ $t('search.enterSearchTerms') }}</p>
            </div>

            <!-- Pagination -->
            <Pagination
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-change="handlePageChange"
            />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.search-header {
  padding: $spacing-8 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.page-title {
  @include heading-2;
  text-align: center;
  margin-bottom: $spacing-4;
}

// Search Mode Toggle
.search-mode-toggle {
  display: flex;
  justify-content: center;
  gap: $spacing-2;
  margin-bottom: $spacing-6;
}

.mode-btn {
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  background-color: transparent;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $bg-secondary;
    border-color: $primary-color;
    color: $primary-color;
  }

  &.active {
    background-color: $primary-color;
    border-color: $primary-color;
    color: $white;
  }
}

// Simple Search Wrapper
.simple-search-wrapper {
  max-width: 700px;
  margin: 0 auto;
}

.search-box-wrapper {
  margin-bottom: $spacing-4;
}

// Search Mode Options (contains, starts with, exact)
.search-mode-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-4;
  flex-wrap: wrap;
}

.search-mode-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.search-mode-option {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  color: $text-primary;
  cursor: pointer;

  input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: $primary-color;
  }

  &:hover {
    color: $primary-color;
  }
}

// Advanced Search Form
.advanced-search-form {
  max-width: 900px;
  margin: 0 auto;
  padding: $spacing-6;
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color-light;
}

// Advanced Search Rows
.advanced-rows {
  margin-bottom: $spacing-6;
}

.advanced-row {
  display: grid;
  grid-template-columns: 100px 180px 1fr 40px;
  gap: $spacing-3;
  align-items: center;
  margin-bottom: $spacing-3;

  @include media-down('md') {
    grid-template-columns: 1fr;
    gap: $spacing-2;
  }
}

.row-operator {
  @include media-down('md') {
    order: -1;
  }
}

.row-operator-placeholder {
  width: 100px;

  @include media-down('md') {
    display: none;
  }
}

.operator-select,
.field-select {
  width: 100%;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  font-family: inherit;
  color: $text-primary;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.row-value {
  flex: 1;
}

.row-remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  color: $error-color;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: rgba($error-color, 0.1);
    border-color: $error-color;
  }
}

.row-remove-placeholder {
  width: 40px;

  @include media-down('md') {
    display: none;
  }
}

.add-row-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $primary-color;
  background-color: transparent;
  border: 1px dashed $primary-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: rgba($primary-color, 0.05);
  }
}

// Date Range Section
.date-range-section {
  margin-top: $spacing-4;
  padding-top: $spacing-4;
  border-top: 1px solid $border-color-light;
}

.section-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-3;
}

.date-range-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-4;

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

// Scope Filters Section (Collection & Community)
.scope-filters-section {
  margin-top: $spacing-4;
  padding-top: $spacing-4;
  border-top: 1px solid $border-color-light;
}

.scope-filters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-4;

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.form-select {
  width: 100%;
  padding: $spacing-3 $spacing-4;
  font-size: $font-size-base;
  font-family: inherit;
  color: $text-primary;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
  }
}

.advanced-search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-4;

  @include media-down('md') {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.form-input {
  padding: $spacing-3 $spacing-4;
  font-size: $font-size-base;
  font-family: inherit;
  color: $text-primary;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  transition: $transition-fast;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
  }

  &::placeholder {
    color: $text-light;
  }
}

.advanced-search-actions {
  display: flex;
  justify-content: center;
  gap: $spacing-3;
  margin-top: $spacing-6;
  padding-top: $spacing-4;
  border-top: 1px solid $border-color-light;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-3 $spacing-6;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  font-family: inherit;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;
  min-width: 120px;
}

.btn-primary {
  background-color: $primary-color;
  color: $white;
  border: none;

  &:hover {
    background-color: $primary-dark;
  }
}

.btn-secondary {
  background-color: $white;
  color: $text-secondary;
  border: 1px solid $border-color;

  &:hover {
    background-color: $bg-secondary;
    border-color: $text-muted;
  }
}

.search-content {
  padding: $spacing-8 0;
}

.search-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: 1fr;
  }
}

// Filters Sidebar
.filters-sidebar {
  @include media-down('lg') {
    position: fixed;
    top: 0;
    inset-inline-start: 0;
    width: 300px;
    height: 100vh;
    background-color: $white;
    z-index: $z-index-modal;
    transform: translateX(-100%);
    transition: transform $transition-duration-normal ease;
    overflow-y: auto;
    padding: $spacing-4;

    [dir='rtl'] & {
      transform: translateX(100%);
    }

    &.is-open {
      transform: translateX(0);
    }
  }

  @include media-up('lg') {
    @include card;
    padding: $spacing-4;
    height: fit-content;
    position: sticky;
    top: 100px;
  }
}

.filters-header {
  @include flex-between;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-3;
  border-bottom: 1px solid $border-color-light;
}

.filters-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;
}

.clear-filters-btn {
  font-size: $font-size-sm;
  color: $error-color;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.filter-group {
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-3;
  border-bottom: 1px solid $border-color-light;
}

.filter-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-2;
}

.filter-group-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0;
}

.filter-group-badges {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.selected-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 $spacing-1;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: $white;
  background-color: $primary-color;
  border-radius: $border-radius-full;
}

.filter-group-count {
  font-size: $font-size-xs;
  color: $text-muted;
}

.facet-toggle-wrapper {
  margin-top: $spacing-2;
  display: flex;
  align-items: center;
}

.facet-toggle-btn {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $primary-color;
  background: rgba($primary-color, 0.08);
  border: 1px solid rgba($primary-color, 0.2);
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;

  span {
    display: flex;
    align-items: center;
    gap: $spacing-1;
  }

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: rgba($primary-color, 0.15);
    border-color: $primary-color;
    color: $primary-dark;
  }

  &:active {
    transform: scale(0.98);
  }
}

.facet-items-info {
  display: block;
  width: 100%;
  text-align: center;
  font-size: $font-size-xs;
  color: $text-muted;
  padding: $spacing-1;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  cursor: pointer;
  padding: $spacing-1 $spacing-2;
  margin: 0 (-$spacing-2);
  border-radius: $border-radius-sm;
  transition: all 0.15s ease;
  user-select: none;

  .filter-radio {
    width: 18px;
    height: 18px;
    border: 2px solid $border-color;
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 0.15s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 10px;
      height: 10px;
      background-color: $primary-color;
      border-radius: 50%;
      transition: transform 0.15s ease;
    }

    &.checked {
      border-color: $primary-color;

      &::after {
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  .filter-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    flex: 1;
    transition: color 0.15s ease;
  }

  .filter-count {
    font-size: $font-size-xs;
    color: $text-muted;
    margin-inline-start: auto;
  }

  &:hover {
    background-color: rgba($primary-color, 0.05);

    .filter-label {
      color: $primary-color;
    }

    .filter-radio {
      border-color: $primary-color;
    }
  }

  &:focus {
    outline: 2px solid rgba($primary-color, 0.3);
    outline-offset: 2px;
  }

  &.is-selected {
    background-color: rgba($primary-color, 0.1);

    .filter-label {
      color: $primary-color;
      font-weight: $font-weight-medium;
    }

    .filter-count {
      color: $primary-color;
    }
  }
}

// Facets Loading State
.facets-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-4;
  color: $text-muted;
  font-size: $font-size-sm;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid $border-color;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// No Facets State
.no-facets {
  padding: $spacing-4;
  text-align: center;
  color: $text-muted;
  font-size: $font-size-sm;

  p {
    margin: 0;
  }
}

// Results Area
.results-area {
  min-width: 0;
}

.results-header {
  @include flex-between;
  flex-wrap: wrap;
  gap: $spacing-4;
  margin-bottom: $spacing-4;
  padding: $spacing-4;
  background-color: $white;
  border-radius: $border-radius-lg;
}

.results-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.filter-toggle {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background-color: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  cursor: pointer;

  &:hover {
    background-color: $bg-tertiary;
  }
}

.results-count {
  font-size: $font-size-sm;
  color: $text-muted;
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.sort-label {
  font-size: $font-size-sm;
  color: $text-muted;
}

.sort-select {
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  background-color: $white;
  cursor: pointer;
}

.results-controls {
  display: flex;
  align-items: center;
  gap: $spacing-4;
}

// View Toggle
.view-toggle {
  display: flex;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  overflow: hidden;
}

.view-btn {
  @include flex-center;
  width: 36px;
  height: 36px;
  background-color: $white;
  border: none;
  color: $text-muted;
  cursor: pointer;
  transition: $transition-fast;

  &:not(:last-child) {
    border-inline-end: 1px solid $border-color;
  }

  &:hover {
    background-color: $bg-secondary;
    color: $text-primary;
  }

  &.active {
    background-color: $primary-color;
    color: $white;
  }
}

.results-loading {
  @include flex-column-center;
  padding: $spacing-12;
  color: $text-muted;
  gap: $spacing-4;
}

// Results Container - Grid and List Views
.results-container {
  &.view-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-4;
  }

  &.view-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
  }
}

.no-results,
.search-initial {
  @include flex-column-center;
  padding: $spacing-12;
  background-color: $white;
  border-radius: $border-radius-lg;
  text-align: center;
}

.no-results-icon,
.initial-icon {
  color: $text-light;
  margin-bottom: $spacing-4;
}

.no-results-title {
  @include heading-4;
  margin-bottom: $spacing-2;
}

.no-results-description,
.initial-text {
  color: $text-muted;
}

// Active Filters Display
.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-3;
  padding: $spacing-4;
  background-color: rgba($primary-color, 0.05);
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-4;
  border: 1px solid rgba($primary-color, 0.15);
}

.active-filters-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  flex: 1;
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-3;
  font-size: $font-size-sm;
  background-color: $primary-color;
  color: $white;
  border: none;
  border-radius: $border-radius-full;
  cursor: pointer;
  transition: all 0.2s ease;

  .chip-facet {
    font-weight: $font-weight-medium;
    opacity: 0.9;
  }

  .chip-value {
    font-weight: $font-weight-semibold;
  }

  svg {
    margin-inline-start: $spacing-1;
    opacity: 0.8;
  }

  &:hover {
    background-color: $error-color;
    transform: scale(1.02);

    svg {
      opacity: 1;
    }
  }
}

.clear-all-filters-btn {
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $error-color;
  background-color: transparent;
  border: 1px solid $error-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: $error-color;
    color: $white;
  }
}
</style>
