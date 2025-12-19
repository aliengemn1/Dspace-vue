<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

const { t } = useI18n()

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.help'), path: null }
])

const activeSection = ref('search')

const helpSections = [
  { id: 'search', title: 'البحث في المستودع', icon: 'search' },
  { id: 'browse', title: 'التصفح', icon: 'folder' },
  { id: 'download', title: 'التحميل', icon: 'download' },
  { id: 'citation', title: 'الاستشهاد المرجعي', icon: 'quote' },
  { id: 'faq', title: 'الأسئلة الشائعة', icon: 'help' }
]

const faqs = [
  {
    question: 'كيف يمكنني البحث عن رسالة علمية معينة؟',
    answer: 'يمكنك استخدام شريط البحث في الصفحة الرئيسية أو صفحة البحث، وإدخال عنوان الرسالة أو اسم المؤلف أو الموضوع. كما يمكنك استخدام البحث المتقدم لتحديد معايير أكثر دقة.'
  },
  {
    question: 'هل يمكنني تحميل الملفات؟',
    answer: 'يتم التحميل بناء على سياسة المكتبة التي يمكن الاطلاع عليها.'
  },
  {
    question: 'كيف يمكنني الحصول على الاستشهاد المرجعي؟',
    answer: 'في صفحة تفاصيل العنصر، ستجد قسم "الاستشهاد المرجعي" الذي يوفر لك الاستشهاد بتنسيقات مختلفة يمكنك نسخها واستخدامها في أبحاثك.'
  },
  {
    question: 'هل أحتاج إلى تسجيل الدخول للوصول إلى المحتوى؟',
    answer: 'معظم المحتوى متاح للجميع بدون تسجيل دخول. بعض الخدمات المتقدمة قد تتطلب تسجيل الدخول.'
  },
  {
    question: 'كيف يمكنني التواصل مع المكتبة؟',
    answer: 'يمكنك التواصل معنا عبر صفحة "اتصل بنا" أو الاتصال بالرقم الموحد أو إرسال بريد إلكتروني.'
  }
]

const openFaq = ref(null)

function toggleFaq(index) {
  openFaq.value = openFaq.value === index ? null : index
}

const icons = {
  'search': 'M11 17.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM21 21l-4.35-4.35',
  'folder': 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  'download': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  'quote': 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
  'help': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3 M12 17h.01'
}
</script>

<template>
  <div class="help-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Header -->
    <div class="help-header">
      <div class="container">
        <h1 class="page-title">{{ $t('footer.userGuide') }}</h1>
        <p class="page-description">
          تعرف على كيفية استخدام المستودع الرقمي والاستفادة من جميع خدماته
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="help-content">
      <div class="container">
        <div class="content-grid">
          <!-- Sidebar Navigation -->
          <aside class="sidebar">
            <nav class="help-nav">
              <button
                v-for="section in helpSections"
                :key="section.id"
                class="nav-item"
                :class="{ 'active': activeSection === section.id }"
                @click="activeSection = section.id"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path :d="icons[section.icon]"/>
                </svg>
                {{ section.title }}
              </button>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="main-content">
            <!-- Search Section -->
            <section v-show="activeSection === 'search'" class="help-section card">
              <h2>البحث في المستودع</h2>

              <h3>البحث البسيط</h3>
              <p>
                يمكنك استخدام شريط البحث الموجود في أعلى الصفحة للبحث السريع.
                أدخل كلمات البحث واضغط Enter أو انقر على زر البحث.
              </p>

              <h3>البحث المتقدم</h3>
              <p>للبحث الأكثر دقة، استخدم البحث المتقدم الذي يتيح لك:</p>
              <ul>
                <li>تحديد حقول البحث (العنوان، المؤلف، الموضوع، إلخ)</li>
                <li>استخدام عوامل التشغيل المنطقية (AND, OR, NOT)</li>
                <li>تحديد نطاق التاريخ</li>
                <li>تصفية النتائج حسب النوع أو المجموعة</li>
              </ul>

              <h3>نصائح للبحث</h3>
              <ul>
                <li>استخدم علامات الاقتباس للبحث عن عبارة محددة: "التحول الرقمي"</li>
                <li>استخدم * للبحث بالبدايات: مكتب* (مكتبة، مكتبات، إلخ)</li>
                <li>استخدم الفلاتر لتضييق نطاق البحث</li>
              </ul>
            </section>

            <!-- Browse Section -->
            <section v-show="activeSection === 'browse'" class="help-section card">
              <h2>التصفح</h2>

              <h3>طرق التصفح</h3>
              <p>يمكنك تصفح محتوى المستودع بعدة طرق:</p>

              <h4>التصفح حسب المجموعات</h4>
              <p>
                المجموعات هي التقسيمات الرئيسية للمستودع (مثل: الرسائل العلمية،
                المخطوطات، الدوريات). انقر على أي مجموعة لعرض محتوياتها.
              </p>

              <h4>التصفح حسب المؤلف</h4>
              <p>عرض قائمة أبجدية بجميع المؤلفين وعدد أعمالهم.</p>

              <h4>التصفح حسب الموضوع</h4>
              <p>عرض الموضوعات والتخصصات المتاحة في المستودع.</p>

              <h4>التصفح حسب التاريخ</h4>
              <p>عرض المحتوى مرتباً حسب سنة النشر.</p>
            </section>

            <!-- Download Section -->
            <section v-show="activeSection === 'download'" class="help-section card">
              <h2>التحميل</h2>

              <h3>كيفية تحميل الملفات</h3>
              <ol>
                <li>انتقل إلى صفحة تفاصيل العنصر</li>
                <li>اضغط على تبويب "الملفات"</li>
                <li>اضغط على زر "تحميل" بجانب الملف المطلوب</li>
              </ol>

              <h3>ملاحظات مهمة</h3>
              <ul>
                <li>بعض الملفات قد تكون محمية بحقوق النشر</li>
                <li>الاستخدام مقتصر على الأغراض البحثية والتعليمية</li>
                <li>يرجى الاستشهاد بالمصدر عند استخدام المحتوى</li>
              </ul>
            </section>

            <!-- Citation Section -->
            <section v-show="activeSection === 'citation'" class="help-section card">
              <h2>الاستشهاد المرجعي</h2>

              <h3>الحصول على الاستشهاد</h3>
              <p>
                يمكنك الحصول على الاستشهاد المرجعي لأي عنصر من صفحة التفاصيل.
                ستجد قسم "الاستشهاد المرجعي" في الشريط الجانبي.
              </p>

              <h3>التنسيقات المتاحة</h3>
              <ul>
                <li>APA</li>
                <li>MLA</li>
                <li>Chicago</li>
                <li>Harvard</li>
              </ul>

              <h3>نسخ الاستشهاد</h3>
              <p>
                انقر على زر "نسخ الاستشهاد" لنسخ النص إلى الحافظة واستخدامه
                في بحثك أو مقالك.
              </p>
            </section>

            <!-- FAQ Section -->
            <section id="faq" v-show="activeSection === 'faq'" class="help-section card">
              <h2>الأسئلة الشائعة</h2>

              <div class="faq-list">
                <div
                  v-for="(faq, index) in faqs"
                  :key="index"
                  class="faq-item"
                  :class="{ 'is-open': openFaq === index }"
                >
                  <button
                    class="faq-question"
                    @click="toggleFaq(index)"
                    :aria-expanded="openFaq === index"
                  >
                    <span>{{ faq.question }}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="faq-icon">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <div class="faq-answer" v-show="openFaq === index">
                    <p>{{ faq.answer }}</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.help-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.help-header {
  padding: $spacing-8 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
  text-align: center;
}

.page-title {
  @include heading-2;
  margin-bottom: $spacing-3;
}

.page-description {
  color: $text-muted;
}

.help-content {
  padding: $spacing-8 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: 1fr;
  }
}

// Sidebar
.sidebar {
  @include media-down('lg') {
    order: -1;
  }
}

.help-nav {
  @include card;
  padding: $spacing-2;
  position: sticky;
  top: 100px;

  @include media-down('lg') {
    position: static;
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-2;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  width: 100%;
  padding: $spacing-3 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  background: none;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  text-align: start;
  transition: $transition-fast;

  @include media-down('lg') {
    width: auto;
  }

  &:hover {
    background-color: $bg-secondary;
    color: $primary-color;
  }

  &.active {
    background-color: $primary-lighter;
    color: $primary-color;
  }
}

// Main Content
.help-section {
  padding: $spacing-6;

  h2 {
    @include heading-3;
    color: $primary-color;
    margin-bottom: $spacing-4;
    padding-bottom: $spacing-3;
    border-bottom: 2px solid $primary-lighter;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    margin-top: $spacing-6;
    margin-bottom: $spacing-3;
  }

  h4 {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    margin-top: $spacing-4;
    margin-bottom: $spacing-2;
  }

  p {
    color: $text-secondary;
    line-height: $line-height-relaxed;
    margin-bottom: $spacing-3;
  }

  ul, ol {
    margin-bottom: $spacing-4;
    padding-inline-start: $spacing-6;

    li {
      margin-bottom: $spacing-2;
      line-height: $line-height-relaxed;
    }
  }
}

// FAQ
.faq-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.faq-item {
  border: 1px solid $border-color-light;
  border-radius: $border-radius-md;
  overflow: hidden;

  &.is-open {
    .faq-icon {
      transform: rotate(180deg);
    }
  }
}

.faq-question {
  @include flex-between;
  width: 100%;
  padding: $spacing-4;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  background-color: $bg-secondary;
  border: none;
  cursor: pointer;
  text-align: start;

  .faq-icon {
    flex-shrink: 0;
    transition: transform $transition-duration-normal ease;
  }
}

.faq-answer {
  padding: $spacing-4;
  background-color: $white;
  border-top: 1px solid $border-color-light;

  p {
    margin: 0;
  }
}
</style>
