import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { search as searchService } from '@/services/dspace'

export const useSearchStore = defineStore('search', () => {
  // State
  const query = ref('')
  const results = ref([])
  const facets = ref({})
  const selectedFacets = ref({})
  const sortBy = ref('score')
  const sortOrder = ref('desc')
  const currentPage = ref(1)
  const pageSize = ref(12)
  const totalResults = ref(0)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value))
  const hasResults = computed(() => results.value.length > 0)
  const hasActiveFilters = computed(() => {
    return Object.values(selectedFacets.value).some(values =>
      Array.isArray(values) ? values.length > 0 : !!values
    )
  })

  // Actions
  async function search(newQuery = null) {
    if (newQuery !== null) {
      query.value = newQuery
      currentPage.value = 1
    }

    if (!query.value.trim()) {
      results.value = []
      totalResults.value = 0
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await searchService.searchWithFacets(
        query.value,
        selectedFacets.value,
        {
          page: currentPage.value - 1,
          size: pageSize.value,
          sort: `${sortBy.value},${sortOrder.value}`
        }
      )

      results.value = response._embedded?.searchResult?._embedded?.objects || []
      totalResults.value = response.page?.totalElements || 0

      // Extract facets
      if (response._embedded?.facets) {
        facets.value = response._embedded.facets.reduce((acc, facet) => {
          acc[facet.name] = facet._embedded?.values || []
          return acc
        }, {})
      }
    } catch (err) {
      error.value = err.message || 'حدث خطأ أثناء البحث'
      results.value = []
      totalResults.value = 0
    } finally {
      isLoading.value = false
    }
  }

  function setFacet(facetName, value) {
    if (!selectedFacets.value[facetName]) {
      selectedFacets.value[facetName] = []
    }

    const index = selectedFacets.value[facetName].indexOf(value)
    if (index > -1) {
      selectedFacets.value[facetName].splice(index, 1)
    } else {
      selectedFacets.value[facetName].push(value)
    }

    currentPage.value = 1
    search()
  }

  function clearFacets() {
    selectedFacets.value = {}
    currentPage.value = 1
    search()
  }

  function setSort(field, order = 'desc') {
    sortBy.value = field
    sortOrder.value = order
    currentPage.value = 1
    search()
  }

  function setPage(page) {
    currentPage.value = page
    search()
  }

  function reset() {
    query.value = ''
    results.value = []
    facets.value = {}
    selectedFacets.value = {}
    sortBy.value = 'score'
    sortOrder.value = 'desc'
    currentPage.value = 1
    totalResults.value = 0
    error.value = null
  }

  return {
    // State
    query,
    results,
    facets,
    selectedFacets,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    totalResults,
    isLoading,
    error,
    // Getters
    totalPages,
    hasResults,
    hasActiveFilters,
    // Actions
    search,
    setFacet,
    clearFacets,
    setSort,
    setPage,
    reset
  }
})
