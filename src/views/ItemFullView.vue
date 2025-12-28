<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import MediaViewer from '@/components/common/MediaViewer.vue'
import { items, bitstreams, utils, statistics } from '@/services/dspace'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

// Is Arabic locale
const isArabic = computed(() => locale.value === 'ar')

const item = ref(null)
const files = ref([])
const isLoading = ref(true)
const error = ref(null)
const showCitationCopied = ref(false)
const showMediaViewer = ref(false)
const selectedFile = ref(null)
const thumbnailUrl = ref(null)
const itemStats = ref({ views: 0, downloads: 0 })

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.browse'), path: '/browse' },
  { label: title.value?.substring(0, 50) + '...' || t('item.title'), path: `/item/${route.params.id}` },
  { label: t('item.fullDetails') || 'التفاصيل الكاملة', path: null }
])

// Get all metadata fields organized by category
const allMetadata = computed(() => {
  if (!item.value?.metadata) return {}

  const metadataMap = item.value.metadata
  const categories = {
    basic: {
      titleAr: 'البيانات الأساسية',
      titleEn: 'Basic Information',
      fields: []
    },
    authors: {
      titleAr: 'المؤلفون والمساهمون',
      titleEn: 'Authors & Contributors',
      fields: []
    },
    dates: {
      titleAr: 'التواريخ',
      titleEn: 'Dates',
      fields: []
    },
    identifiers: {
      titleAr: 'المعرفات',
      titleEn: 'Identifiers',
      fields: []
    },
    description: {
      titleAr: 'الوصف',
      titleEn: 'Description',
      fields: []
    },
    rights: {
      titleAr: 'الحقوق والوصول',
      titleEn: 'Rights & Access',
      fields: []
    },
    other: {
      titleAr: 'بيانات إضافية',
      titleEn: 'Additional Information',
      fields: []
    }
  }

  // Basic info
  addField(categories.basic.fields, 'dc.title', 'العنوان', 'Title', metadataMap)
  addField(categories.basic.fields, 'dc.title.alternative', 'عنوان بديل', 'Alternative Title', metadataMap)
  addField(categories.basic.fields, 'dc.type', 'النوع', 'Type', metadataMap)
  addField(categories.basic.fields, 'dc.language.iso', 'اللغة', 'Language', metadataMap)
  addField(categories.basic.fields, 'dc.format', 'التنسيق', 'Format', metadataMap)
  addField(categories.basic.fields, 'dc.format.extent', 'الحجم', 'Extent', metadataMap)

  // Authors
  addField(categories.authors.fields, 'dc.contributor.author', 'المؤلف', 'Author', metadataMap, true)
  addField(categories.authors.fields, 'dc.contributor.advisor', 'المشرف', 'Advisor', metadataMap, true)
  addField(categories.authors.fields, 'dc.contributor.editor', 'المحرر', 'Editor', metadataMap, true)
  addField(categories.authors.fields, 'dc.contributor', 'المساهم', 'Contributor', metadataMap, true)
  addField(categories.authors.fields, 'dc.creator', 'المنشئ', 'Creator', metadataMap, true)

  // Dates
  addField(categories.dates.fields, 'dc.date.issued', 'تاريخ النشر', 'Date Issued', metadataMap)
  addField(categories.dates.fields, 'dc.date.issuedhijri', 'التاريخ الهجري', 'Hijri Date', metadataMap)
  addField(categories.dates.fields, 'dc.date.hijri', 'التاريخ الهجري', 'Hijri Date', metadataMap)
  addField(categories.dates.fields, 'dc.date.created', 'تاريخ الإنشاء', 'Date Created', metadataMap)
  addField(categories.dates.fields, 'dc.date.submitted', 'تاريخ التقديم', 'Date Submitted', metadataMap)
  addField(categories.dates.fields, 'dc.date.accessioned', 'تاريخ الإيداع', 'Date Accessioned', metadataMap)
  addField(categories.dates.fields, 'dc.date.available', 'تاريخ الإتاحة', 'Date Available', metadataMap)

  // Identifiers
  addField(categories.identifiers.fields, 'dc.identifier.callnumber', 'رقم الطلب', 'Call Number', metadataMap)
  addField(categories.identifiers.fields, 'dc.identifier.callnum', 'رقم الطلب', 'Call Number', metadataMap)
  addField(categories.identifiers.fields, 'dc.identifier.uri', 'الرابط الدائم', 'Permanent URI', metadataMap)
  addField(categories.identifiers.fields, 'dc.identifier.isbn', 'ISBN', 'ISBN', metadataMap)
  addField(categories.identifiers.fields, 'dc.identifier.issn', 'ISSN', 'ISSN', metadataMap)
  addField(categories.identifiers.fields, 'dc.identifier.doi', 'DOI', 'DOI', metadataMap)
  addField(categories.identifiers.fields, 'dc.identifier.citation', 'الاقتباس', 'Citation', metadataMap)
  addField(categories.identifiers.fields, 'dc.identifier', 'معرف', 'Identifier', metadataMap)

  // Description
  addField(categories.description.fields, 'dc.description.abstract', 'المستخلص', 'Abstract', metadataMap)
  addField(categories.description.fields, 'dc.description', 'الوصف', 'Description', metadataMap)
  addField(categories.description.fields, 'dc.description.extent', 'الحجم/عدد الصفحات', 'Extent/Pages', metadataMap)
  addField(categories.description.fields, 'dc.description.theses', 'معلومات الرسالة', 'Thesis Info', metadataMap)
  addField(categories.description.fields, 'dc.description.localnote', 'ملاحظات محلية', 'Local Notes', metadataMap)
  addField(categories.description.fields, 'dc.subject', 'الموضوعات', 'Subjects', metadataMap, true)
  addField(categories.description.fields, 'dc.subject.isi', 'تصنيف ISI', 'ISI Subject', metadataMap)
  addField(categories.description.fields, 'dc.coverage.spatial', 'التغطية المكانية', 'Spatial Coverage', metadataMap)
  addField(categories.description.fields, 'dc.coverage.temporal', 'التغطية الزمنية', 'Temporal Coverage', metadataMap)

  // Rights
  addField(categories.rights.fields, 'dc.rights', 'الحقوق', 'Rights', metadataMap)
  addField(categories.rights.fields, 'dc.rights.uri', 'رابط الحقوق', 'Rights URI', metadataMap)
  addField(categories.rights.fields, 'dc.rights.holder', 'صاحب الحقوق', 'Rights Holder', metadataMap)
  addField(categories.rights.fields, 'dc.publisher', 'الناشر', 'Publisher', metadataMap)
  addField(categories.rights.fields, 'dc.publisher.place', 'مكان النشر', 'Place of Publication', metadataMap)
  addField(categories.rights.fields, 'dc.publisher.city', 'المدينة', 'City', metadataMap)
  addField(categories.rights.fields, 'dc.publisher.country', 'الدولة', 'Country', metadataMap)

  // Other fields
  addField(categories.other.fields, 'dc.source', 'المصدر', 'Source', metadataMap)
  addField(categories.other.fields, 'dc.relation', 'العلاقة', 'Relation', metadataMap)
  addField(categories.other.fields, 'dc.relation.ispartof', 'جزء من', 'Part Of', metadataMap)
  addField(categories.other.fields, 'dc.relation.ispartofseries', 'جزء من سلسلة', 'Part of Series', metadataMap)

  // Filter out empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([, category]) => category.fields.length > 0)
  )
})

function addField(fieldsArray, key, labelAr, labelEn, metadataMap, isArray = false) {
  const value = utils.getMetadataValue(metadataMap, key, isArray)
  if (value && (Array.isArray(value) ? value.length > 0 : true)) {
    fieldsArray.push({ key, labelAr, labelEn, value, isArray })
  }
}

const title = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.title') || ''
})

const authors = computed(() => {
  if (!item.value?.metadata) return []
  return utils.getMetadataValue(item.value.metadata, 'dc.contributor.author', true) || []
})

const itemDate = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.date.issued') || ''
})

const publisher = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.publisher') || ''
})

const itemType = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.type') || ''
})

const itemLanguage = computed(() => {
  if (!item.value?.metadata) return ''
  const lang = utils.getMetadataValue(item.value.metadata, 'dc.language.iso') || ''
  // Map common language codes to readable names
  const langMap = {
    'ar': 'العربية',
    'en': 'English',
    'en_US': 'English',
    'ar_SA': 'العربية',
    'fr': 'Français',
    'de': 'Deutsch'
  }
  return langMap[lang] || lang
})

const advisor = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.contributor.advisor') || ''
})

const abstract = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.description.abstract') || ''
})

const typeColors = {
  'رسالة ماجستير': '#006C35',
  'رسالة دكتوراه': '#1B4D3E',
  'بحث علمي': '#17A2B8',
  'كتاب': '#C8A415',
  'مقال': '#6F42C1',
  'تقرير': '#FD7E14',
  'default': '#757575'
}

const typeColor = computed(() => {
  return typeColors[itemType.value] || typeColors.default
})

async function loadItem() {
  isLoading.value = true
  error.value = null

  try {
    const itemId = route.params.id
    console.log('Loading full item view:', itemId)

    // Get item details from API
    const itemData = await items.getById(itemId)
    console.log('Item data received:', itemData)
    item.value = itemData

    // Get bundles and files
    try {
      const bundlesResponse = await items.getBundles(itemId)
      console.log('Bundles response:', bundlesResponse)

      if (bundlesResponse._embedded?.bundles) {
        for (const bundle of bundlesResponse._embedded.bundles) {
          // Get thumbnail from THUMBNAIL bundle
          if (bundle.name === 'THUMBNAIL') {
            const bundleId = bundle.uuid || bundle.id
            try {
              const thumbResponse = await bitstreams.getByBundle(bundleId)
              if (thumbResponse._embedded?.bitstreams?.length > 0) {
                const thumb = thumbResponse._embedded.bitstreams[0]
                thumbnailUrl.value = bitstreams.getContentUrl(thumb.uuid || thumb.id)
              }
            } catch (e) {
              console.warn('Could not load thumbnail from bundle:', e)
            }
          }

          // Get files from ORIGINAL bundle
          if (bundle.name === 'ORIGINAL') {
            const bundleId = bundle.uuid || bundle.id
            const bitstreamResponse = await bitstreams.getByBundle(bundleId)
            console.log('Bitstreams response:', bitstreamResponse)

            if (bitstreamResponse._embedded?.bitstreams) {
              files.value = bitstreamResponse._embedded.bitstreams.map(bs => {
                // Extract mimeType from various possible locations
                let mimeType = 'application/octet-stream'

                if (bs.metadata?.['dc.format.mimetype']?.[0]?.value) {
                  mimeType = bs.metadata['dc.format.mimetype'][0].value
                } else if (bs.mimeType) {
                  mimeType = bs.mimeType
                } else if (bs.format?.mimetype) {
                  mimeType = bs.format.mimetype
                } else if (bs.name) {
                  const ext = bs.name.toLowerCase().split('.').pop()
                  const mimeMap = {
                    'pdf': 'application/pdf',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'gif': 'image/gif',
                    'mp4': 'video/mp4',
                    'doc': 'application/msword',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  }
                  if (mimeMap[ext]) {
                    mimeType = mimeMap[ext]
                  }
                }

                return {
                  id: bs.uuid || bs.id,
                  name: bs.name,
                  sizeBytes: bs.sizeBytes,
                  mimeType: mimeType
                }
              })
            }
          }
        }
      }
    } catch (bundleErr) {
      console.warn('Could not load bundles:', bundleErr)
      // Continue without files - item can still be displayed
    }

    // Fallback: Try to get thumbnail from item's _links if not found in bundle
    if (!thumbnailUrl.value && itemData._links?.thumbnail?.href) {
      thumbnailUrl.value = itemData._links.thumbnail.href
    }

    // Get item statistics from API
    try {
      const stats = await statistics.getItemStats(itemId, false)
      itemStats.value = {
        views: stats.views || 0,
        downloads: stats.downloads || 0
      }
    } catch (statsErr) {
      console.warn('Could not load statistics:', statsErr)
    }
  } catch (err) {
    console.error('Error loading item:', err)
    error.value = err.message || 'فشل تحميل بيانات العنصر'
    item.value = null
    files.value = []
  } finally {
    isLoading.value = false
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function downloadFile(file) {
  const url = bitstreams.getContentUrl(file.id)
  window.open(url, '_blank')
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  showCitationCopied.value = true
  setTimeout(() => showCitationCopied.value = false, 2000)
}

function goToSimpleView() {
  router.push(`/item/${route.params.id}`)
}

function isViewableFile(file) {
  const viewableMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav'
  ]
  return viewableMimeTypes.includes(file.mimeType)
}

function openFileViewer(file) {
  selectedFile.value = file
  showMediaViewer.value = true
}

function closeMediaViewer() {
  showMediaViewer.value = false
  selectedFile.value = null
}

function handleSelectFile(file) {
  selectedFile.value = file
}

function isUrl(value) {
  return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))
}

onMounted(() => {
  loadItem()
})
</script>

<template>
  <div class="item-full-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-content">
        <div class="spinner spinner-lg"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !item" class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2>{{ isArabic ? 'حدث خطأ' : 'An error occurred' }}</h2>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="loadItem">
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Item Content -->
    <div v-else-if="item" class="item-content">
      <!-- Header -->
      <div class="item-header">
        <div class="container">
          <div class="header-layout">
            <!-- Thumbnail -->
            <div class="header-thumbnail" v-if="thumbnailUrl">
              <img :src="thumbnailUrl" :alt="title" class="thumbnail-image" />
            </div>

            <div class="header-content">
              <div class="header-top">
                <div class="header-badges">
                  <span class="item-type-badge" :style="{ backgroundColor: typeColor }">
                    {{ itemType }}
                  </span>
                  <span v-if="itemLanguage" class="item-lang-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    {{ itemLanguage }}
                  </span>
                </div>
                <button class="btn btn-secondary btn-sm" @click="goToSimpleView">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  {{ isArabic ? 'العرض البسيط' : 'Simple View' }}
                </button>
              </div>
              <h1 class="item-title">{{ title }}</h1>
              <div class="item-meta">
                <span v-if="authors.length > 0" class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {{ authors.join(isArabic ? '، ' : ', ') }}
                </span>
                <span v-if="itemDate" class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ itemDate }}
                </span>
                <span v-if="publisher" class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  {{ publisher }}
                </span>
                <span v-if="advisor" class="meta-item advisor-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                  <span class="advisor-label">{{ isArabic ? 'المشرف:' : 'Advisor:' }}</span> {{ advisor }}
                </span>
              </div>

              <!-- Abstract Preview -->
              <div v-if="abstract" class="abstract-preview">
                <p>{{ abstract.length > 300 ? abstract.substring(0, 300) + '...' : abstract }}</p>
              </div>

              <!-- Statistics from API -->
              <div class="item-stats">
                <div class="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span class="stat-value">{{ itemStats.views.toLocaleString() }}</span>
                  <span class="stat-label">{{ isArabic ? 'مشاهدة' : 'views' }}</span>
                </div>
                <div class="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span class="stat-value">{{ itemStats.downloads.toLocaleString() }}</span>
                  <span class="stat-label">{{ isArabic ? 'تحميل' : 'downloads' }}</span>
                </div>
                <div class="stat-badge" v-if="files.length > 0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span class="stat-value">{{ files.length }}</span>
                  <span class="stat-label">{{ isArabic ? 'ملفات' : 'files' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="container">
          <div class="content-layout">
            <!-- Metadata Sections -->
            <main class="metadata-sections">
              <div
                v-for="(category, key) in allMetadata"
                :key="key"
                class="metadata-section"
              >
                <div class="section-header">
                  <h2 class="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    {{ isArabic ? category.titleAr : category.titleEn }}
                  </h2>
                </div>
                <div class="section-content">
                  <table class="metadata-table">
                    <tbody>
                      <tr v-for="field in category.fields" :key="field.key">
                        <th>{{ isArabic ? field.labelAr : field.labelEn }}</th>
                        <td>
                          <template v-if="Array.isArray(field.value)">
                            <div class="value-list">
                              <span
                                v-for="(val, i) in field.value"
                                :key="i"
                                class="value-tag"
                              >
                                <a v-if="isUrl(val)" :href="val" target="_blank" rel="noopener">{{ val }}</a>
                                <template v-else>{{ val }}</template>
                              </span>
                            </div>
                          </template>
                          <template v-else>
                            <a v-if="isUrl(field.value)" :href="field.value" target="_blank" rel="noopener" class="value-link">
                              {{ field.value }}
                            </a>
                            <span v-else class="value-text">{{ field.value }}</span>
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Inline File Viewer Section -->
              <div v-if="showMediaViewer && selectedFile" class="metadata-section file-viewer-section">
                <div class="section-header">
                  <h2 class="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ isArabic ? 'عرض الملف' : 'File Viewer' }}: {{ selectedFile.name }}
                  </h2>
                  <button class="btn btn-close-viewer" @click="closeMediaViewer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    {{ isArabic ? 'إغلاق العرض' : 'Close Viewer' }}
                  </button>
                </div>
                <div class="section-content viewer-content">
                  <MediaViewer
                    :files="files"
                    :selected-file="selectedFile"
                    @close="closeMediaViewer"
                    @download="downloadFile"
                    @select-file="handleSelectFile"
                  />
                </div>
              </div>

              <!-- Files Section -->
              <div v-if="files.length > 0" class="metadata-section files-section">
                <div class="section-header">
                  <h2 class="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {{ isArabic ? 'الملفات المرفقة' : 'Attached Files' }} ({{ files.length }})
                  </h2>
                </div>
                <div class="section-content">
                  <div class="files-list">
                    <div
                      v-for="file in files"
                      :key="file.id"
                      class="file-item"
                      :class="{ 'is-selected': selectedFile?.id === file.id && showMediaViewer }"
                    >
                      <div class="file-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div class="file-info">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-meta">
                          {{ formatFileSize(file.sizeBytes) }}
                          <span class="separator">•</span>
                          {{ file.mimeType }}
                        </span>
                      </div>
                      <div class="file-actions">
                        <button
                          v-if="isViewableFile(file)"
                          class="btn btn-view-file"
                          @click="openFileViewer(file)"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          <span>{{ isArabic ? 'عرض' : 'View' }}</span>
                        </button>
                        <button class="btn btn-download-file" @click="downloadFile(file)">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          <span>{{ isArabic ? 'تحميل' : 'Download' }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <!-- Sidebar -->
            <aside class="sidebar">
              <!-- Actions -->
              <div class="sidebar-card">
                <h3 class="sidebar-title">{{ isArabic ? 'الإجراءات' : 'Actions' }}</h3>
                <div class="actions-list">
                  <button class="action-btn" @click="goToSimpleView">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ isArabic ? 'عرض المستند' : 'View Document' }}
                  </button>
                  <button class="action-btn" @click="copyToClipboard(window.location.href)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    {{ isArabic ? 'نسخ الرابط' : 'Copy Link' }}
                  </button>
                </div>
              </div>

              <!-- Citation -->
              <div class="sidebar-card">
                <h3 class="sidebar-title">{{ isArabic ? 'الاقتباس' : 'Citation' }}</h3>
                <div class="citation-box">
                  <p class="citation-text">
                    {{ authors.join(isArabic ? '، ' : ', ') }} ({{ itemDate }}).
                    <em>{{ title }}</em>.
                    {{ publisher }}.
                  </p>
                  <button
                    class="btn btn-secondary btn-sm btn-full"
                    @click="copyToClipboard(`${authors.join(isArabic ? '، ' : ', ')} (${itemDate}). ${title}. ${publisher}.`)"
                  >
                    {{ showCitationCopied ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ الاقتباس' : 'Copy Citation') }}
                  </button>
                </div>
              </div>

              <!-- Export Formats -->
              <div class="sidebar-card">
                <h3 class="sidebar-title">{{ isArabic ? 'تصدير البيانات' : 'Export Data' }}</h3>
                <div class="export-buttons">
                  <button class="export-btn">
                    <span class="format">RIS</span>
                    <span class="label">EndNote</span>
                  </button>
                  <button class="export-btn">
                    <span class="format">BibTeX</span>
                    <span class="label">LaTeX</span>
                  </button>
                  <button class="export-btn">
                    <span class="format">XML</span>
                    <span class="label">Dublin Core</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.item-full-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

// Loading & Error
.loading-container,
.error-container {
  @include flex-center;
  min-height: 60vh;
  padding: $spacing-8;
}

.loading-content,
.error-content {
  @include flex-column-center;
  gap: $spacing-4;
  text-align: center;
}

.error-icon {
  color: $error-color;
  opacity: 0.7;
}

// Header
.item-header {
  background: linear-gradient(135deg, $primary-darker 0%, $primary-dark 50%, $primary-color 100%);
  padding: $spacing-8 0;
  color: $white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 20% 80%, rgba($accent-color, 0.15) 0%, transparent 50%);
  }
}

.header-layout {
  position: relative;
  display: flex;
  gap: $spacing-6;
  align-items: flex-start;

  @include media-down('md') {
    flex-direction: column;
    align-items: center;
  }
}

.header-thumbnail {
  flex-shrink: 0;

  .thumbnail-image {
    width: 180px;
    height: auto;
    max-height: 250px;
    object-fit: contain;
    background-color: $white;
    border-radius: $border-radius-lg;
    box-shadow: 0 10px 30px rgba($black, 0.3);
    padding: $spacing-2;
  }

  @include media-down('md') {
    .thumbnail-image {
      width: 150px;
    }
  }
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-4;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.item-lang-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $white;
  background-color: rgba($white, 0.2);
  border-radius: $border-radius-full;
  backdrop-filter: blur(10px);

  svg {
    opacity: 0.8;
  }
}

.item-type-badge {
  display: inline-flex;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $white;
  border-radius: $border-radius-full;
}

.item-title {
  font-size: 1.75rem;
  font-weight: $font-weight-bold;
  color: $accent-color;
  line-height: $line-height-tight;
  margin-bottom: $spacing-4;

  @include media-down('md') {
    font-size: 1.5rem;
    text-align: center;
  }
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  @include media-down('md') {
    justify-content: center;
  }
}

.meta-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  color: rgba($white, 0.9);
  font-size: $font-size-sm;

  svg {
    color: rgba($white, 0.7);
  }

  &.advisor-item {
    background-color: rgba($accent-color, 0.2);
    padding: $spacing-1 $spacing-3;
    border-radius: $border-radius-full;

    .advisor-label {
      font-weight: $font-weight-semibold;
      color: $accent-color;
    }
  }
}

.abstract-preview {
  margin-bottom: $spacing-4;
  padding: $spacing-4;
  background-color: rgba($white, 0.1);
  border-radius: $border-radius-lg;
  border-inline-start: 3px solid $accent-color;

  p {
    font-size: $font-size-sm;
    color: rgba($white, 0.9);
    line-height: $line-height-relaxed;
    margin: 0;
  }
}

.item-stats {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;

  @include media-down('md') {
    justify-content: center;
  }
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background-color: rgba($white, 0.15);
  border-radius: $border-radius-full;
  font-size: $font-size-sm;

  svg {
    opacity: 0.8;
  }

  .stat-value {
    font-weight: $font-weight-bold;
    color: $white;
  }

  .stat-label {
    color: rgba($white, 0.7);
  }
}

// Main Content
.main-content {
  padding: $spacing-8 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: 1fr;
  }
}

// Metadata Sections
.metadata-sections {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
}

.metadata-section {
  @include card;
  overflow: hidden;
}

.section-header {
  padding: $spacing-4 $spacing-5;
  background-color: $bg-secondary;
  border-bottom: 1px solid $border-color-light;
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;

  svg {
    color: $primary-color;
  }
}

.section-content {
  padding: 0;
}

.metadata-table {
  width: 100%;

  th, td {
    padding: $spacing-4 $spacing-5;
    text-align: start;
    border-bottom: 1px solid $border-color-light;
    vertical-align: top;
  }

  th {
    width: 200px;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    background-color: rgba($bg-secondary, 0.5);
  }

  td {
    color: $text-secondary;
  }

  tr:last-child {
    th, td {
      border-bottom: none;
    }
  }
}

.value-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.value-tag {
  display: inline-block;
  padding: $spacing-1 $spacing-3;
  background-color: $primary-lighter;
  color: $primary-color;
  border-radius: $border-radius-full;
  font-size: $font-size-sm;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.value-text {
  line-height: $line-height-relaxed;
}

.value-link {
  color: $primary-color;
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
}

// File Viewer Section (Inline)
.file-viewer-section {
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $spacing-3;
  }

  .viewer-content {
    padding: 0;
    min-height: 600px;
  }
}

.btn-close-viewer {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
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
    background-color: rgba($error-color, 0.1);
    border-color: $error-color;
    color: $error-color;
  }
}

// Files Section
.files-section {
  .section-content {
    padding: $spacing-4;
  }
}

.file-item.is-selected {
  background-color: $primary-lighter;
  border: 2px solid $primary-color;
  border-radius: $border-radius-md;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.file-item {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-4;
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
  transition: $transition-fast;

  &:hover {
    background-color: $bg-tertiary;
  }
}

.file-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  background-color: $white;
  border-radius: $border-radius-md;
  color: $error-color;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
  min-width: 0;
}

.file-name {
  font-weight: $font-weight-medium;
  color: $text-primary;
  @include truncate(1);
}

.file-meta {
  font-size: $font-size-sm;
  color: $text-muted;

  .separator {
    margin: 0 $spacing-2;
  }
}

// Sidebar
.sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;

  @include media-down('lg') {
    order: -1;
  }
}

.sidebar-card {
  @include card;
  padding: $spacing-5;
}

.sidebar-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-3;
  border-bottom: 1px solid $border-color-light;
}

// Actions
.actions-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3;
  background-color: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  color: $text-primary;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $primary-lighter;
    border-color: $primary-color;
    color: $primary-color;
  }
}

// Citation
.citation-box {
  background-color: $bg-secondary;
  padding: $spacing-4;
  border-radius: $border-radius-md;
}

.citation-text {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: $line-height-relaxed;
  margin-bottom: $spacing-4;

  em {
    font-style: normal;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }
}

.btn-full {
  width: 100%;
  justify-content: center;
}

// Export Buttons
.export-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-2;
}

.export-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-3;
  background-color: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $primary-lighter;
    border-color: $primary-color;

    .format {
      color: $primary-color;
    }
  }

  .format {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .label {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

// File Actions
.file-actions {
  display: flex;
  gap: $spacing-3;
  flex-shrink: 0;
}

.btn-view-file {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $primary-color;
  background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, rgba($primary-light, 0.15) 100%);
  border: 2px solid rgba($primary-color, 0.3);
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: linear-gradient(135deg, rgba($primary-color, 0.2) 0%, rgba($primary-light, 0.25) 100%);
    border-color: $primary-color;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.2);
  }
}

.btn-download-file {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $white;
  background: linear-gradient(135deg, $success-color 0%, color.adjust($success-color, $lightness: -10%) 100%);
  border: 2px solid transparent;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba($success-color, 0.3);

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: linear-gradient(135deg, color.adjust($success-color, $lightness: -5%) 0%, color.adjust($success-color, $lightness: -15%) 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba($success-color, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba($success-color, 0.3);
  }
}

</style>
