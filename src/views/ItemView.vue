<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import MediaViewer from '@/components/common/MediaViewer.vue'
import { items, bitstreams, utils, statistics } from '@/services/dspace'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const item = ref(null)
const files = ref([])
const isLoading = ref(true)
const error = ref(null)
const selectedFile = ref(null)
const showMediaViewer = ref(false)
const showCitationCopied = ref(false)
const showLinkCopied = ref(false)
const selectedCitationFormat = ref('apa')
const itemStats = ref({ views: 0, downloads: 0 })
const thumbnailUrl = ref(null)

// Filter files by type
const pdfFiles = computed(() => files.value.filter(f => f.mimeType === 'application/pdf'))
const imageFiles = computed(() => files.value.filter(f => f.mimeType?.startsWith('image/')))
const videoFiles = computed(() => files.value.filter(f => f.mimeType?.startsWith('video/')))

// Get first previewable file for thumbnail
const primaryFile = computed(() => {
  if (pdfFiles.value.length > 0) return pdfFiles.value[0]
  if (imageFiles.value.length > 0) return imageFiles.value[0]
  if (videoFiles.value.length > 0) return videoFiles.value[0]
  return files.value[0] || null
})

// Check if there are previewable files
const hasPreviewableFiles = computed(() => {
  return pdfFiles.value.length > 0 || imageFiles.value.length > 0 || videoFiles.value.length > 0
})

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.browse'), path: '/browse' },
  { label: title.value || t('item.title'), path: null }
])

// Grouped metadata for clean display
const subjectMetadata = computed(() => {
  if (!item.value?.metadata) return []
  const metadataMap = item.value.metadata
  return utils.getMetadataValue(metadataMap, 'dc.subject', true) || []
})

const identifierMetadata = computed(() => {
  if (!item.value?.metadata) return []
  const metadataMap = item.value.metadata
  return [
    { key: 'callnumber', label: 'Call Number', labelAr: 'رقم الطلب', value: utils.getMetadataValue(metadataMap, 'dc.identifier.callnumber') || utils.getMetadataValue(metadataMap, 'dc.identifier.callnum') },
    { key: 'uri', label: 'Handle', labelAr: 'المعرف الدائم', value: utils.getMetadataValue(metadataMap, 'dc.identifier.uri') },
    { key: 'doi', label: 'DOI', labelAr: 'معرف DOI', value: utils.getMetadataValue(metadataMap, 'dc.identifier.doi') },
    { key: 'isbn', label: 'ISBN', labelAr: 'رقم ISBN', value: utils.getMetadataValue(metadataMap, 'dc.identifier.isbn') },
    { key: 'issn', label: 'ISSN', labelAr: 'رقم ISSN', value: utils.getMetadataValue(metadataMap, 'dc.identifier.issn') }
  ].filter(m => m.value)
})

const detailMetadata = computed(() => {
  if (!item.value?.metadata) return []
  const metadataMap = item.value.metadata
  return [
    { key: 'type', label: t('item.fields.type'), labelAr: 'النوع', value: utils.getMetadataValue(metadataMap, 'dc.type') },
    { key: 'language', label: t('item.fields.language'), labelAr: 'اللغة', value: utils.getMetadataValue(metadataMap, 'dc.language.iso') },
    { key: 'publisher', label: t('item.fields.publisher'), labelAr: 'الناشر', value: utils.getMetadataValue(metadataMap, 'dc.publisher') },
    { key: 'city', label: t('item.fields.city'), labelAr: 'مكان النشر', value: utils.getMetadataValue(metadataMap, 'dc.publisher.place') || utils.getMetadataValue(metadataMap, 'dc.publisher.city') },
    { key: 'country', label: 'Country', labelAr: 'الدولة', value: utils.getMetadataValue(metadataMap, 'dc.publisher.country') || utils.getMetadataValue(metadataMap, 'dc.coverage.spatial') },
    { key: 'dateHijri', label: t('item.fields.dateHijri'), labelAr: 'التاريخ الهجري', value: utils.getMetadataValue(metadataMap, 'dc.date.issuedhijri') || utils.getMetadataValue(metadataMap, 'dc.date.hijri') },
    { key: 'extent', label: t('item.fields.extent'), labelAr: 'الحجم/عدد الصفحات', value: utils.getMetadataValue(metadataMap, 'dc.format.extent') || utils.getMetadataValue(metadataMap, 'dc.description.extent') },
    { key: 'theses', label: 'Thesis Info', labelAr: 'معلومات الرسالة', value: utils.getMetadataValue(metadataMap, 'dc.description.theses') },
    { key: 'subjectIsi', label: 'ISI Subject', labelAr: 'تصنيف ISI', value: utils.getMetadataValue(metadataMap, 'dc.subject.isi') },
    { key: 'description', label: 'Description', labelAr: 'الوصف', value: utils.getMetadataValue(metadataMap, 'dc.description') },
    { key: 'rights', label: t('item.fields.rights'), labelAr: 'الحقوق', value: utils.getMetadataValue(metadataMap, 'dc.rights') },
    { key: 'format', label: 'Format', labelAr: 'الصيغة', value: utils.getMetadataValue(metadataMap, 'dc.format') }
  ].filter(m => m.value)
})

const title = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.title') || ''
})

const authors = computed(() => {
  if (!item.value?.metadata) return []
  return utils.getMetadataValue(item.value.metadata, 'dc.contributor.author', true) || []
})

const abstract = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.description.abstract') || ''
})

const itemType = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.type') || ''
})

const itemDate = computed(() => {
  if (!item.value?.metadata) return ''
  const dateValue = utils.getMetadataValue(item.value.metadata, 'dc.date.issued') || ''
  // Extract only the year (first 4 characters) - no comma
  if (dateValue && dateValue.length >= 4) {
    return dateValue.substring(0, 4)
  }
  return dateValue
})

const publisher = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.publisher') || ''
})

const source = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.source') || ''
})

const partOf = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.relation.ispartof') || ''
})

const advisor = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.contributor.advisor') || ''
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

const format = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.format') || ''
})

const extent = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.format.extent') ||
         utils.getMetadataValue(item.value.metadata, 'dc.description.extent') || ''
})

const callNumber = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.identifier.callnumber') ||
         utils.getMetadataValue(item.value.metadata, 'dc.identifier.callnum') || ''
})

const city = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.publisher.place') ||
         utils.getMetadataValue(item.value.metadata, 'dc.publisher.city') || ''
})

const dateHijri = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.date.issuedhijri') ||
         utils.getMetadataValue(item.value.metadata, 'dc.date.hijri') || ''
})

const isbn = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.identifier.isbn') || ''
})

const description = computed(() => {
  if (!item.value?.metadata) return ''
  return utils.getMetadataValue(item.value.metadata, 'dc.description') || ''
})

// Citation formats
const citationFormats = [
  { id: 'apa', label: 'APA' },
  { id: 'mla', label: 'MLA' },
  { id: 'chicago', label: 'Chicago' },
  { id: 'harvard', label: 'Harvard' },
  { id: 'library', label: locale.value === 'ar' ? 'تنسيق المكتبة' : 'Library Format' },
  { id: 'bibtex', label: 'BibTeX' },
  { id: 'endnote', label: 'EndNote' },
  { id: 'ris', label: 'RIS' }
]

const formattedCitation = computed(() => {
  const year = itemDate.value || 'n.d.'
  const titleText = title.value || ''
  const publisherText = publisher.value || ''

  // Format authors for APA/Harvard style (Last, F. M.)
  const formatAuthorsAPA = () => {
    if (authors.value.length === 0) return 'Unknown Author'
    if (authors.value.length === 1) return authors.value[0]
    if (authors.value.length === 2) return `${authors.value[0]}, & ${authors.value[1]}`
    // APA 7: List up to 20 authors, use et al. for 21+
    if (authors.value.length <= 20) {
      const lastAuthor = authors.value[authors.value.length - 1]
      const otherAuthors = authors.value.slice(0, -1).join(', ')
      return `${otherAuthors}, & ${lastAuthor}`
    }
    return `${authors.value.slice(0, 19).join(', ')}, ... ${authors.value[authors.value.length - 1]}`
  }

  // Format authors for MLA style (Last, First)
  const formatAuthorsMLA = () => {
    if (authors.value.length === 0) return 'Unknown Author'
    if (authors.value.length === 1) return authors.value[0]
    if (authors.value.length === 2) return `${authors.value[0]}, and ${authors.value[1]}`
    // MLA 9: Use et al. for 3+ authors
    return `${authors.value[0]}, et al.`
  }

  // Format authors for Chicago style
  const formatAuthorsChicago = () => {
    if (authors.value.length === 0) return 'Unknown Author'
    if (authors.value.length === 1) return authors.value[0]
    if (authors.value.length === 2) return `${authors.value[0]} and ${authors.value[1]}`
    if (authors.value.length === 3) return `${authors.value[0]}, ${authors.value[1]}, and ${authors.value[2]}`
    // Chicago: Use et al. for 4+ authors in notes, list all in bibliography
    return `${authors.value[0]} et al.`
  }

  switch (selectedCitationFormat.value) {
    case 'apa':
      // APA 7th Edition: Author, A. A. (Year). Title of work. Publisher.
      if (publisherText) {
        return `${formatAuthorsAPA()} (${year}). ${titleText}. ${publisherText}.`
      }
      return `${formatAuthorsAPA()} (${year}). ${titleText}.`

    case 'mla':
      // MLA 9th Edition: Author. "Title." Publisher, Year.
      if (publisherText) {
        return `${formatAuthorsMLA()}. "${titleText}." ${publisherText}, ${year}.`
      }
      return `${formatAuthorsMLA()}. "${titleText}." ${year}.`

    case 'chicago':
      // Chicago 17th Edition (Author-Date): Author. Year. "Title." Publisher.
      if (publisherText) {
        return `${formatAuthorsChicago()}. ${year}. "${titleText}." ${publisherText}.`
      }
      return `${formatAuthorsChicago()}. ${year}. "${titleText}."`

    case 'harvard':
      // Harvard: Author (Year) Title, Publisher.
      if (publisherText) {
        return `${formatAuthorsAPA()} (${year}) ${titleText}, ${publisherText}.`
      }
      return `${formatAuthorsAPA()} (${year}) ${titleText}.`

    case 'library':
      // Library catalog format: Author. Title / Author. -- Publisher, Year.
      const authorsText = authors.value.length > 0 ? authors.value.join(' ; ') : 'Unknown Author'
      if (publisherText) {
        return `${authorsText}. ${titleText} / ${authorsText}. -- ${publisherText}, ${year}.`
      }
      return `${authorsText}. ${titleText} / ${authorsText}. -- ${year}.`

    case 'bibtex':
      // BibTeX format
      const bibtexKey = (authors.value[0]?.split(' ')[0] || 'unknown') + year
      const bibtexAuthors = authors.value.join(' and ')
      return `@article{${bibtexKey},
  author = {${bibtexAuthors || 'Unknown'}},
  title = {${titleText}},
  year = {${year}},
  publisher = {${publisherText || ''}}
}`

    case 'endnote':
      // EndNote format
      let endnoteStr = '%0 Journal Article\n'
      authors.value.forEach(author => {
        endnoteStr += `%A ${author}\n`
      })
      endnoteStr += `%T ${titleText}\n`
      endnoteStr += `%D ${year}\n`
      if (publisherText) endnoteStr += `%I ${publisherText}\n`
      return endnoteStr.trim()

    case 'ris':
      // RIS format (Research Information Systems)
      let risStr = 'TY  - JOUR\n'
      authors.value.forEach(author => {
        risStr += `AU  - ${author}\n`
      })
      risStr += `TI  - ${titleText}\n`
      risStr += `PY  - ${year}\n`
      if (publisherText) risStr += `PB  - ${publisherText}\n`
      risStr += 'ER  -'
      return risStr

    default:
      return `${authors.value.join(', ')} (${year}). ${titleText}. ${publisherText}.`
  }
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

// Is Arabic locale
const isArabic = computed(() => locale.value === 'ar')

async function loadItem() {
  isLoading.value = true
  error.value = null

  try {
    const itemId = route.params.id
    console.log('Loading item:', itemId)

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
                console.log('Thumbnail URL from bundle:', thumbnailUrl.value)
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
                    'webp': 'image/webp',
                    'mp4': 'video/mp4',
                    'webm': 'video/webm',
                    'mp3': 'audio/mpeg',
                    'wav': 'audio/wav',
                    'doc': 'application/msword',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'xls': 'application/vnd.ms-excel',
                    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
    }

    // Fallback: Try to get thumbnail from item's _links if not found in bundle
    if (!thumbnailUrl.value && itemData._links?.thumbnail?.href) {
      thumbnailUrl.value = itemData._links.thumbnail.href
      console.log('Thumbnail URL from item _links:', thumbnailUrl.value)
    }

    // Record this view in DSpace statistics
    try {
      await statistics.recordItemView(itemId)
      console.log('View recorded for item:', itemId)
    } catch (viewErr) {
      console.warn('Could not record view:', viewErr)
    }

    // Get item statistics from API (after recording view)
    try {
      const stats = await statistics.getItemStats(itemId, false) // Don't use cache to get fresh stats
      console.log('Item statistics from API:', stats)
      itemStats.value = {
        views: stats.views || 0,
        downloads: stats.downloads || 0
      }
      console.log('Statistics:', itemStats.value)
    } catch (statsErr) {
      console.warn('Could not load statistics:', statsErr)
      itemStats.value = { views: 0, downloads: 0 }
    }
  } catch (err) {
    console.error('Error loading item:', err)
    error.value = err.message || 'فشل تحميل بيانات العنصر'
    item.value = null
    files.value = []
  } finally {
    isLoading.value = false
    // Auto-select first previewable file
    if (hasPreviewableFiles.value) {
      selectedFile.value = primaryFile.value
    }
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function copyToClipboard(text, type = 'link') {
  navigator.clipboard.writeText(text)
  if (type === 'citation') {
    showCitationCopied.value = true
    setTimeout(() => showCitationCopied.value = false, 2000)
  } else {
    showLinkCopied.value = true
    setTimeout(() => showLinkCopied.value = false, 2000)
  }
}

function openFilePreview(file) {
  selectedFile.value = file
  showMediaViewer.value = true
  // Scroll to viewer
  nextTick(() => {
    const viewerSection = document.querySelector('.file-viewer-section')
    if (viewerSection) {
      viewerSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function closeMediaViewer() {
  showMediaViewer.value = false
}

function openThumbnailPreview() {
  if (primaryFile.value) {
    openFilePreview(primaryFile.value)
  }
}

function goToFullView() {
  router.push(`/item/${route.params.id}/full`)
}

function getFileIcon(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType?.startsWith('image/')) return 'image'
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType?.includes('word')) return 'word'
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'excel'
  return 'file'
}

function getFileTypeLabel(mimeType) {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType?.startsWith('image/')) return isArabic.value ? 'صورة' : 'Image'
  if (mimeType?.startsWith('video/')) return isArabic.value ? 'فيديو' : 'Video'
  if (mimeType?.includes('word')) return 'Word'
  if (mimeType?.includes('excel')) return 'Excel'
  return isArabic.value ? 'ملف' : 'File'
}

function isPreviewable(mimeType) {
  return mimeType === 'application/pdf' || mimeType?.startsWith('image/') || mimeType?.startsWith('video/')
}

// Keyboard navigation for accessibility
function handleKeydown(event, action) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    action()
  }
}

onMounted(() => {
  loadItem()
})
</script>

<template>
  <div class="item-view" role="main">
    <!-- Breadcrumb -->
    <nav class="breadcrumb-section" aria-label="Breadcrumb">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container" role="status" aria-live="polite">
      <div class="loading-content">
        <div class="spinner spinner-lg" aria-hidden="true"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !item" class="error-container" role="alert">
      <div class="error-content">
        <div class="error-icon" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2>{{ isArabic ? 'حدث خطأ' : 'An error occurred' }}</h2>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="loadItem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Item Content -->
    <article v-else-if="item" class="item-content">
      <!-- Two-Column Header Layout -->
      <header class="item-header">
        <div class="container">
          <div class="header-grid">
            <!-- Left Column: Thumbnail -->
            <div class="header-thumbnail">
              <div
                class="thumbnail-wrapper"
                :class="{ 'has-preview': hasPreviewableFiles }"
                @click="hasPreviewableFiles && openThumbnailPreview()"
                @keydown="(e) => hasPreviewableFiles && handleKeydown(e, openThumbnailPreview)"
                :tabindex="hasPreviewableFiles ? 0 : -1"
                :role="hasPreviewableFiles ? 'button' : 'img'"
                :aria-label="hasPreviewableFiles ? (isArabic ? 'اضغط لعرض الملف' : 'Click to preview file') : title"
              >
                <!-- Thumbnail Image or Placeholder -->
                <img
                  v-if="thumbnailUrl"
                  :src="thumbnailUrl"
                  :alt="title"
                  class="thumbnail-image"
                  loading="lazy"
                />
                <div v-else class="thumbnail-placeholder">
                  <svg v-if="itemType.includes('كتاب') || itemType.toLowerCase().includes('book')" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  <svg v-else-if="itemType.includes('رسالة') || itemType.toLowerCase().includes('thesis')" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                  <svg v-else width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>

                <!-- Preview Overlay -->
                <div v-if="hasPreviewableFiles" class="thumbnail-overlay">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{{ isArabic ? 'معاينة' : 'Preview' }}</span>
                </div>

                <!-- Type Badge on Thumbnail -->
                <span v-if="itemType" class="type-badge" :style="{ backgroundColor: typeColor }">
                  {{ itemType }}
                </span>
                <!-- Language Badge -->
                <span v-if="itemLanguage" class="lang-badge">
                  {{ itemLanguage }}
                </span>
              </div>

              <!-- Quick File Actions -->
              <div class="thumbnail-actions">
                <button
                  v-if="primaryFile"
                  class="btn btn-primary btn-action"
                  @click="openFilePreview(primaryFile)"
                  :aria-label="isArabic ? 'عرض الملف' : 'View file'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {{ isArabic ? 'عرض' : 'View' }}
                </button>
              </div>
            </div>

            <!-- Right Column: Title & Basic Info -->
            <div class="header-info">
              <!-- Title -->
              <h1 class="item-title">{{ title }}</h1>

              <!-- Authors -->
              <div v-if="authors.length" class="item-authors" role="list" aria-label="Authors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <div class="authors-list">
                  <router-link
                    v-for="(author, index) in authors"
                    :key="index"
                    :to="`/browse?type=author&filter=${encodeURIComponent(author)}`"
                    class="author-link"
                    role="listitem"
                  >
                    {{ author }}<span v-if="index < authors.length - 1" aria-hidden="true">، </span>
                  </router-link>
                </div>
              </div>

              <!-- Advisor (for thesis items) -->
              <div v-if="advisor" class="item-advisor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                </svg>
                <span class="advisor-label">{{ isArabic ? 'المشرف:' : 'Advisor:' }}</span>
                <router-link
                  :to="`/browse?type=author&filter=${encodeURIComponent(advisor)}`"
                  class="advisor-name"
                >
                  {{ advisor }}
                </router-link>
              </div>

              <!-- Meta Row -->
              <div class="item-meta-row">
                <div class="meta-chip" v-if="itemDate">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{{ itemDate }}</span>
                </div>
                <div class="meta-chip" v-if="publisher">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>{{ publisher }}</span>
                </div>
                <div class="meta-chip" v-if="files.length > 0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span>{{ files.length }} {{ files.length === 1 ? (isArabic ? 'ملف' : 'file') : (isArabic ? 'ملفات' : 'files') }}</span>
                </div>
                <div class="meta-chip" v-if="extent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  <span>{{ extent }}</span>
                </div>
              </div>

              <!-- Source & Part Of Row -->
              <div v-if="source || partOf" class="item-relation-row">
                <!-- Source -->
                <div v-if="source" class="relation-card">
                  <div class="relation-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div class="relation-content">
                    <span class="relation-label">{{ $t('item.source') }}</span>
                    <router-link
                      :to="`/search?q=${encodeURIComponent(source)}`"
                      class="relation-link"
                    >
                      {{ source }}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </router-link>
                  </div>
                </div>
                <!-- Part Of -->
                <div v-if="partOf" class="relation-card">
                  <div class="relation-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <div class="relation-content">
                    <span class="relation-label">{{ $t('item.partOf') }}</span>
                    <router-link
                      :to="`/search?q=${encodeURIComponent(partOf)}`"
                      class="relation-link"
                    >
                      {{ partOf }}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Statistics from API -->
              <div class="item-stats">
                <div class="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span class="stat-value">{{ itemStats.views.toLocaleString() }}</span>
                  <span class="stat-label">{{ isArabic ? 'مشاهدة' : 'views' }}</span>
                </div>
                <div class="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span class="stat-value">{{ itemStats.downloads.toLocaleString() }}</span>
                  <span class="stat-label">{{ isArabic ? 'تحميل' : 'downloads' }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="header-actions">
                <button
                  class="btn btn-outline-primary"
                  @click="copyToClipboard(window.location.href, 'link')"
                  :aria-label="isArabic ? 'نسخ الرابط' : 'Copy link'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  {{ showLinkCopied ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ الرابط' : 'Copy Link') }}
                </button>
                <button
                  class="btn btn-outline-secondary"
                  @click="goToFullView"
                  :aria-label="isArabic ? 'عرض التفاصيل الكاملة' : 'View full details'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  {{ isArabic ? 'التفاصيل الكاملة' : 'Full Details' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="item-main-content">
        <div class="container">
          <!-- Inline File Viewer Section -->
          <section
            v-if="showMediaViewer && selectedFile"
            class="content-section file-viewer-section"
            aria-label="File Viewer"
          >
            <div class="section-header">
              <h2 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ isArabic ? 'عرض الملف' : 'File Viewer' }}: {{ selectedFile.name }}
              </h2>
              <button
                class="btn btn-close-viewer"
                @click="closeMediaViewer"
                :aria-label="isArabic ? 'إغلاق العرض' : 'Close viewer'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                {{ isArabic ? 'إغلاق' : 'Close' }}
              </button>
            </div>
            <div class="viewer-content">
              <MediaViewer
                :files="files"
                :selected-file="selectedFile"
                @close="closeMediaViewer"
                @select-file="(file) => selectedFile = file"
              />
            </div>
          </section>

          <!-- Abstract Section -->
          <section v-if="abstract" class="content-section abstract-section" aria-labelledby="abstract-title">
            <h2 id="abstract-title" class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              {{ isArabic ? 'الملخص' : 'Abstract' }}
            </h2>
            <p class="abstract-text">{{ abstract }}</p>
          </section>

          <!-- Subjects Section -->
          <section v-if="subjectMetadata.length > 0" class="content-section subjects-section" aria-labelledby="subjects-title">
            <h2 id="subjects-title" class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="4" y1="9" x2="20" y2="9"/>
                <line x1="4" y1="15" x2="20" y2="15"/>
                <line x1="10" y1="3" x2="8" y2="21"/>
                <line x1="16" y1="3" x2="14" y2="21"/>
              </svg>
              {{ isArabic ? 'الموضوعات' : 'Subjects' }}
            </h2>
            <div class="subjects-list" role="list">
              <router-link
                v-for="(subject, index) in subjectMetadata"
                :key="index"
                :to="`/search?q=${encodeURIComponent(subject)}`"
                class="subject-tag"
                role="listitem"
              >
                {{ subject }}
              </router-link>
            </div>
          </section>

          <!-- Files Section -->
          <section v-if="files.length > 0" class="content-section files-section" aria-labelledby="files-title">
            <h2 id="files-title" class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {{ isArabic ? 'الملفات المتاحة' : 'Available Files' }} ({{ files.length }})
            </h2>
            <div class="files-grid" role="list">
              <div
                v-for="file in files"
                :key="file.id"
                class="file-card"
                :class="{ 'is-selected': selectedFile?.id === file.id && showMediaViewer }"
                role="listitem"
              >
                <div class="file-icon" :class="`file-icon-${getFileIcon(file.mimeType)}`" aria-hidden="true">
                  <svg v-if="file.mimeType === 'application/pdf'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M9 13h2v4H9z"/>
                    <path d="M13 13h2v4h-2z"/>
                  </svg>
                  <svg v-else-if="file.mimeType?.startsWith('image/')" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <svg v-else-if="file.mimeType?.startsWith('video/')" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <div class="file-meta">
                    <span class="file-type">{{ getFileTypeLabel(file.mimeType) }}</span>
                    <span class="file-separator">•</span>
                    <span class="file-size">{{ formatFileSize(file.sizeBytes) }}</span>
                  </div>
                </div>
                <div class="file-actions">
                  <button
                    v-if="isPreviewable(file.mimeType)"
                    class="btn btn-view-file"
                    @click="openFilePreview(file)"
                    :aria-label="`${isArabic ? 'عرض' : 'View'} ${file.name}`"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span class="btn-text">{{ isArabic ? 'عرض' : 'View' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Details Grid (Identifiers + Other Metadata) -->
          <div class="details-grid">
            <!-- Identifiers Card -->
            <section v-if="identifierMetadata.length > 0" class="content-section identifiers-section" aria-labelledby="identifiers-title">
              <h2 id="identifiers-title" class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                {{ isArabic ? 'المعرفات' : 'Identifiers' }}
              </h2>
              <dl class="identifiers-list">
                <div v-for="id in identifierMetadata" :key="id.key" class="identifier-item">
                  <dt class="identifier-label">{{ isArabic ? id.labelAr : id.label }}</dt>
                  <dd class="identifier-value">
                    <a v-if="id.key === 'uri' || id.key === 'doi'" :href="id.key === 'doi' ? `https://doi.org/${id.value}` : id.value" target="_blank" rel="noopener">
                      {{ id.value }}
                    </a>
                    <span v-else>{{ id.value }}</span>
                  </dd>
                </div>
              </dl>
            </section>

            <!-- Details Card -->
            <section v-if="detailMetadata.length > 0" class="content-section details-section" aria-labelledby="details-title">
              <h2 id="details-title" class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                {{ isArabic ? 'التفاصيل' : 'Details' }}
              </h2>
              <dl class="details-list">
                <div v-for="detail in detailMetadata" :key="detail.key" class="detail-item">
                  <dt class="detail-label">{{ isArabic ? detail.labelAr : detail.label }}</dt>
                  <dd class="detail-value">{{ detail.value }}</dd>
                </div>
              </dl>
            </section>

            <!-- Citation Card -->
            <section class="content-section citation-section" aria-labelledby="citation-title">
              <h2 id="citation-title" class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
                {{ isArabic ? 'الاستشهاد' : 'Citation' }}
              </h2>
              <!-- Citation Format Selector -->
              <div class="citation-formats">
                <button
                  v-for="format in citationFormats"
                  :key="format.id"
                  class="citation-format-btn"
                  :class="{ 'active': selectedCitationFormat === format.id }"
                  @click="selectedCitationFormat = format.id"
                >
                  {{ format.label }}
                </button>
              </div>
              <div class="citation-box">
                <p class="citation-text">{{ formattedCitation }}</p>
                <button
                  class="btn btn-copy-citation"
                  @click="copyToClipboard(formattedCitation, 'citation')"
                  :aria-label="isArabic ? 'نسخ الاستشهاد' : 'Copy citation'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {{ showCitationCopied ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ الاستشهاد' : 'Copy Citation') }}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.item-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

// Loading & Error States
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

.error-content h2 {
  @include heading-3;
  color: $text-primary;
}

.error-content p {
  color: $text-muted;
  margin-bottom: $spacing-4;
}

// Item Header - Two Column Layout
.item-header {
  background: linear-gradient(135deg, $primary-darker 0%, $primary-dark 50%, $primary-color 100%);
  padding: $spacing-8 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 80%, rgba($accent-color, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba($accent-light, 0.1) 0%, transparent 50%);
  }
}

.header-grid {
  position: relative;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: $spacing-8;
  align-items: start;

  @include media-down('lg') {
    grid-template-columns: 220px 1fr;
    gap: $spacing-6;
  }

  @include media-down('md') {
    grid-template-columns: 1fr;
    gap: $spacing-6;
  }
}

// Thumbnail Section
.header-thumbnail {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;

  @include media-down('md') {
    align-items: center;
  }
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background-color: rgba($white, 0.1);
  border-radius: $border-radius-xl;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba($black, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  @include media-down('md') {
    max-width: 280px;
  }

  &.has-preview {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 48px rgba($black, 0.4);

      .thumbnail-overlay {
        opacity: 1;
      }
    }

    &:focus {
      outline: 3px solid $accent-color;
      outline-offset: 4px;
    }
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: rgba($white, 0.95);
  padding: $spacing-2;
}

.thumbnail-placeholder {
  @include flex-center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba($white, 0.15) 0%, rgba($white, 0.05) 100%);
  color: rgba($white, 0.6);
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  @include flex-column-center;
  gap: $spacing-2;
  background: rgba($black, 0.5);
  color: $white;
  opacity: 0;
  transition: opacity 0.3s ease;

  span {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
  }
}

.type-badge {
  position: absolute;
  top: $spacing-3;
  inset-inline-start: $spacing-3;
  padding: $spacing-1 $spacing-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $white;
  border-radius: $border-radius-full;
  box-shadow: 0 4px 12px rgba($black, 0.2);
}

.lang-badge {
  position: absolute;
  bottom: $spacing-3;
  inset-inline-start: $spacing-3;
  padding: $spacing-1 $spacing-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $white;
  background-color: rgba($white, 0.25);
  border-radius: $border-radius-full;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba($black, 0.1);
}

.thumbnail-actions {
  display: flex;
  gap: $spacing-3;
  width: 100%;

  @include media-down('md') {
    justify-content: center;
  }
}

.btn-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  border-radius: $border-radius-lg;
  transition: all 0.3s ease;

  &.btn-primary {
    background: $white;
    color: $primary-color;
    border: none;

    &:hover {
      background: $gray-100;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba($black, 0.2);
    }
  }

  &.btn-success {
    background: $success-color;
    color: $white;
    border: none;

    &:hover {
      background: color.adjust($success-color, $lightness: -8%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba($success-color, 0.4);
    }
  }
}

// Header Info Section
.header-info {
  color: $white;
}

.item-title {
  font-size: 2rem;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  margin-bottom: $spacing-4;
  color: $accent-color;

  @include media-down('md') {
    font-size: 1.5rem;
    text-align: center;
  }
}

.item-authors {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  color: rgba($white, 0.9);
  margin-bottom: $spacing-4;

  @include media-down('md') {
    justify-content: center;
    text-align: center;
  }

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .authors-list {
    line-height: $line-height-relaxed;
  }

  .author-link {
    font-weight: $font-weight-medium;
    color: rgba($white, 0.95);
    text-decoration: none;
    transition: all 0.2s ease;
    padding: 2px 6px;
    border-radius: $border-radius-sm;
    margin: -2px -6px;

    &:hover {
      color: $accent-color;
      background-color: rgba($white, 0.15);
      text-decoration: underline;
    }
  }
}

.item-advisor {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-bottom: $spacing-4;
  padding: $spacing-2 $spacing-4;
  background-color: rgba($accent-color, 0.2);
  border-radius: $border-radius-full;
  width: fit-content;

  @include media-down('md') {
    margin-left: auto;
    margin-right: auto;
  }

  svg {
    color: $accent-color;
    flex-shrink: 0;
  }

  .advisor-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $accent-color;
  }

  .advisor-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $white;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      color: $accent-light;
      text-decoration: underline;
    }
  }
}

.item-relation-row {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;
  margin-bottom: $spacing-4;

  @include media-down('md') {
    flex-direction: column;
    gap: $spacing-3;
  }
}

.relation-card {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  background: linear-gradient(135deg, rgba($white, 0.15) 0%, rgba($white, 0.08) 100%);
  border-radius: $border-radius-lg;
  border: 1px solid rgba($white, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;

  &:hover {
    background: linear-gradient(135deg, rgba($white, 0.2) 0%, rgba($white, 0.12) 100%);
    border-color: rgba($accent-color, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba($black, 0.2);
  }

  @include media-down('md') {
    min-width: 100%;
  }
}

.relation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: rgba($accent-color, 0.2);
  border-radius: $border-radius-md;
  color: $accent-color;
  flex-shrink: 0;
}

.relation-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
  min-width: 0;
  flex: 1;
}

.relation-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: rgba($white, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.relation-link {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  color: $white;
  text-decoration: none;
  font-weight: $font-weight-medium;
  font-size: $font-size-sm;
  transition: all 0.2s ease;
  word-break: break-word;

  svg {
    flex-shrink: 0;
    opacity: 0.6;
    transition: all 0.2s ease;
  }

  &:hover {
    color: $accent-color;

    svg {
      opacity: 1;
      transform: translate(2px, -2px);
    }
  }
}

.item-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;
  margin-bottom: $spacing-4;

  @include media-down('md') {
    justify-content: center;
  }
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background-color: rgba($white, 0.15);
  border-radius: $border-radius-full;
  font-size: $font-size-sm;
  color: rgba($white, 0.9);
}

.item-stats {
  display: flex;
  gap: $spacing-4;
  margin-bottom: $spacing-5;

  @include media-down('md') {
    justify-content: center;
  }
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background-color: rgba($white, 0.1);
  border-radius: $border-radius-lg;
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

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;

  @include media-down('md') {
    justify-content: center;
  }
}

.btn-outline-primary,
.btn-outline-secondary {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  border-radius: $border-radius-lg;
  transition: all 0.3s ease;
}

.btn-outline-primary {
  background-color: transparent;
  border: 2px solid rgba($white, 0.5);
  color: $white;

  &:hover {
    background-color: rgba($white, 0.1);
    border-color: $white;
  }
}

.btn-outline-secondary {
  background-color: rgba($white, 0.1);
  border: 2px solid transparent;
  color: $white;

  &:hover {
    background-color: rgba($white, 0.2);
  }
}

// Main Content
.item-main-content {
  padding: $spacing-8 0;
}

// Content Sections
.content-section {
  background-color: $white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-sm;
  padding: $spacing-6;
  margin-bottom: $spacing-6;
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-5;
  padding-bottom: $spacing-4;
  border-bottom: 2px solid $border-color-light;

  svg {
    color: $primary-color;
    flex-shrink: 0;
  }
}

// File Viewer Section
.file-viewer-section {
  background: linear-gradient(135deg, $primary-lighter 0%, $white 100%);
  border: 2px solid $primary-light;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $spacing-3;
    margin-bottom: $spacing-4;
  }

  .section-title {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.btn-close-viewer {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $error-color;
  background-color: rgba($error-color, 0.1);
  border: 1px solid rgba($error-color, 0.3);
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: $error-color;
    color: $white;
  }
}

.viewer-content {
  min-height: 500px;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

// Abstract Section
.abstract-section {
  .abstract-text {
    color: $text-secondary;
    line-height: $line-height-relaxed;
    text-align: justify;
    font-size: $font-size-base;
  }
}

// Subjects Section
.subjects-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.subject-tag {
  display: inline-flex;
  align-items: center;
  padding: $spacing-2 $spacing-4;
  background: linear-gradient(135deg, $primary-lighter 0%, rgba($primary-light, 0.3) 100%);
  color: $primary-dark;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border-radius: $border-radius-full;
  text-decoration: none;
  border: 1px solid rgba($primary-color, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: $primary-color;
    color: $white;
    border-color: $primary-color;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.3);
  }
}

// Files Section
.files-grid {
  display: grid;
  gap: $spacing-4;
}

.file-card {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-4;
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background-color: $bg-tertiary;
    border-color: $border-color;
  }

  &.is-selected {
    background-color: $primary-lighter;
    border-color: $primary-color;
  }

  @include media-down('sm') {
    flex-direction: column;
    text-align: center;
  }
}

.file-icon {
  @include flex-center;
  width: 52px;
  height: 52px;
  background-color: $white;
  border-radius: $border-radius-lg;
  flex-shrink: 0;

  &-pdf {
    color: #E74C3C;
    background-color: rgba(#E74C3C, 0.1);
  }

  &-image {
    color: #9B59B6;
    background-color: rgba(#9B59B6, 0.1);
  }

  &-video {
    color: #3498DB;
    background-color: rgba(#3498DB, 0.1);
  }

  &-word {
    color: #2B579A;
    background-color: rgba(#2B579A, 0.1);
  }

  &-excel {
    color: #217346;
    background-color: rgba(#217346, 0.1);
  }

  &-file {
    color: $text-muted;
    background-color: $gray-100;
  }
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-1;
  @include truncate(1);
}

.file-meta {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  color: $text-muted;

  @include media-down('sm') {
    justify-content: center;
  }
}

.file-separator {
  opacity: 0.5;
}

.file-actions {
  display: flex;
  gap: $spacing-2;
  flex-shrink: 0;

  @include media-down('sm') {
    width: 100%;
    justify-content: center;
  }
}

.btn-view-file {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all 0.3s ease;
  color: $primary-color;
  background: rgba($primary-color, 0.1);
  border: 1px solid rgba($primary-color, 0.3);

  .btn-text {
    @include media-down('xs') {
      display: none;
    }
  }

  &:hover {
    background: $primary-color;
    color: $white;
    border-color: $primary-color;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.3);
  }
}

// Details Grid
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-6;
}

// Identifiers Section
.identifiers-list,
.details-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.identifier-item,
.detail-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
  padding: $spacing-3;
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
}

.identifier-label,
.detail-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.identifier-value,
.detail-value {
  font-size: $font-size-sm;
  color: $text-primary;

  a {
    color: $primary-color;
    text-decoration: none;
    word-break: break-all;

    &:hover {
      text-decoration: underline;
    }
  }
}

// Citation Section
.citation-formats {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-bottom: $spacing-4;
}

.citation-format-btn {
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  background-color: $bg-secondary;
  border: 2px solid $border-color;
  border-radius: $border-radius-full;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }

  &.active {
    background-color: $primary-color;
    border-color: $primary-color;
    color: $white;
  }
}

.citation-box {
  background-color: $bg-secondary;
  padding: $spacing-4;
  border-radius: $border-radius-lg;
  border-inline-start: 4px solid $primary-color;
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

.btn-copy-citation {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $primary-color;
  background-color: $white;
  border: 1px solid $primary-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: $primary-color;
    color: $white;
  }
}

// Responsive adjustments
@include media-down('md') {
  .content-section {
    padding: $spacing-5;
  }

  .item-header {
    padding: $spacing-6 0;
  }
}
</style>
