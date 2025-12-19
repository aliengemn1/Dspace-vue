<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

const { t } = useI18n()

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.about'), path: null }
])
</script>

<template>
  <div class="about-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Header -->
    <div class="about-header">
      <div class="container">
        <h1 class="page-title">{{ $t('about.title') }}</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="about-content">
      <div class="container">
        <div class="content-grid">
          <!-- Main Content -->
          <main class="main-content">
            <!-- Vision Section -->
            <section class="content-section card">
              <h2 class="section-title">{{ $t('about.vision') }}</h2>
              <p>
                أن تكون مكتبة الملك فهد الوطنية مركزاً رائداً في جمع وحفظ وإتاحة التراث الفكري
                والثقافي للمملكة العربية السعودية، ومرجعاً موثوقاً للباحثين والدارسين محلياً وعالمياً.
              </p>
            </section>

            <!-- Mission Section -->
            <section class="content-section card">
              <h2 class="section-title">{{ $t('about.mission') }}</h2>
              <p>
                تسعى مكتبة الملك فهد الوطنية إلى جمع وحفظ وتنظيم وإتاحة الإنتاج الفكري الوطني
                والعربي والعالمي، وتوفير خدمات معلوماتية متميزة تلبي احتياجات المستفيدين،
                مع الالتزام بأعلى المعايير المهنية والتقنية.
              </p>
            </section>

            <!-- Goals Section -->
            <section class="content-section card">
              <h2 class="section-title">{{ $t('about.goals') }}</h2>
              <ul class="goals-list">
                <li>جمع الإنتاج الفكري السعودي والعربي وحفظه وتوثيقه</li>
                <li>إتاحة المصادر المعلوماتية للباحثين والدارسين</li>
                <li>تطوير البنية التحتية الرقمية للمكتبة</li>
                <li>توفير خدمات معلوماتية متميزة ومتطورة</li>
                <li>نشر الوعي المعلوماتي والثقافي في المجتمع</li>
                <li>بناء شراكات استراتيجية مع المؤسسات المحلية والدولية</li>
              </ul>
            </section>

            <!-- Repository Info -->
            <section id="policies" class="content-section card">
              <h2 class="section-title">{{ $t('about.policies') }}</h2>
              <div class="policy-item">
                <h3>سياسة المحتوى</h3>
                <p>
                  يحتوي المستودع الرقمي على الرسائل العلمية والأبحاث والمخطوطات والدوريات
                  وغيرها من المواد الفكرية التي تجمعها المكتبة وفقاً لسياستها في التجميع والحفظ.
                </p>
              </div>
              <div class="policy-item">
                <h3>سياسة الوصول</h3>
                <p>
                  يوفر المستودع الوصول المفتوح للمحتوى الرقمي وفقاً لحقوق النشر والاستخدام
                  المحددة لكل عنصر.
                </p>
              </div>
              <div class="policy-item">
                <h3>سياسة الخصوصية</h3>
                <p>
                  تلتزم المكتبة بحماية خصوصية المستخدمين وعدم مشاركة بياناتهم الشخصية
                  مع أي جهة خارجية.
                </p>
              </div>
            </section>

            <!-- Accessibility -->
            <section id="accessibility" class="content-section card">
              <h2 class="section-title">إمكانية الوصول</h2>
              <p>
                تلتزم مكتبة الملك فهد الوطنية بجعل المستودع الرقمي متاحاً لجميع المستخدمين،
                بما في ذلك ذوي الاحتياجات الخاصة. نسعى للامتثال لمعايير WCAG 2.1 المستوى AA.
              </p>
              <ul>
                <li>دعم قارئات الشاشة</li>
                <li>التنقل باستخدام لوحة المفاتيح</li>
                <li>تباين الألوان المناسب</li>
                <li>نصوص بديلة للصور</li>
              </ul>
            </section>
          </main>

          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="sidebar-card card">
              <h3 class="sidebar-title">روابط مفيدة</h3>
              <ul class="sidebar-links">
                <li>
                  <a href="https://kfnl.gov.sa" target="_blank" rel="noopener">
                    الموقع الرسمي للمكتبة
                  </a>
                </li>
                <li>
                  <router-link to="/help">دليل المستخدم</router-link>
                </li>
                <li>
                  <router-link to="/contact">اتصل بنا</router-link>
                </li>
              </ul>
            </div>

            <div class="sidebar-card card">
              <h3 class="sidebar-title">تواصل معنا</h3>
              <div class="contact-info">
                <p>
                  <strong>العنوان:</strong><br/>
                  طريق الملك فهد، حي العليا<br/>
                  الرياض، المملكة العربية السعودية
                </p>
                <p>
                  <strong>الهاتف:</strong><br/>
                  <span dir="ltr">+966 11 462 3388</span>
                </p>
                <p>
                  <strong>البريد الإلكتروني:</strong><br/>
                  <a href="mailto:info@kfnl.gov.sa">info@kfnl.gov.sa</a>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.about-header {
  padding: $spacing-8 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
  text-align: center;
}

.page-title {
  @include heading-2;
  margin: 0;
}

.about-content {
  padding: $spacing-8 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: 1fr;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
}

.content-section {
  padding: $spacing-6;
}

.section-title {
  @include heading-4;
  color: $primary-color;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-3;
  border-bottom: 2px solid $primary-lighter;
}

.goals-list {
  padding-inline-start: $spacing-6;

  li {
    margin-bottom: $spacing-2;
    line-height: $line-height-relaxed;
  }
}

.policy-item {
  margin-bottom: $spacing-4;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-2;
  }

  p {
    color: $text-secondary;
    line-height: $line-height-relaxed;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;

  @include media-down('lg') {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.sidebar-card {
  padding: $spacing-4;
}

.sidebar-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  margin-bottom: $spacing-3;
  padding-bottom: $spacing-2;
  border-bottom: 1px solid $border-color-light;
}

.sidebar-links {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: $spacing-2;
  }

  a {
    color: $text-secondary;
    text-decoration: none;

    &:hover {
      color: $primary-color;
    }
  }
}

.contact-info {
  p {
    margin-bottom: $spacing-3;
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: $primary-color;
  }
}
</style>
