import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'الرئيسية',
      titleEn: 'Home'
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: {
      title: 'البحث',
      titleEn: 'Search'
    }
  },
  {
    path: '/browse',
    name: 'browse',
    component: () => import('@/views/BrowseView.vue'),
    meta: {
      title: 'التصفح',
      titleEn: 'Browse'
    }
  },
  {
    path: '/communities',
    name: 'communities',
    component: () => import('@/views/CommunitiesView.vue'),
    meta: {
      title: 'المجموعات',
      titleEn: 'Communities'
    }
  },
  {
    path: '/community/:id',
    name: 'community',
    component: () => import('@/views/CommunityView.vue'),
    meta: {
      title: 'المجتمع',
      titleEn: 'Community'
    }
  },
  {
    path: '/collection/:id',
    name: 'collection',
    component: () => import('@/views/CollectionView.vue'),
    meta: {
      title: 'المجموعة',
      titleEn: 'Collection'
    }
  },
  {
    path: '/item/:id',
    name: 'item',
    component: () => import('@/views/ItemView.vue'),
    meta: {
      title: 'العنصر',
      titleEn: 'Item'
    }
  },
  {
    path: '/item/:id/full',
    name: 'item-full',
    component: () => import('@/views/ItemFullView.vue'),
    meta: {
      title: 'التفاصيل الكاملة',
      titleEn: 'Full Details'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: 'عن المستودع',
      titleEn: 'About'
    }
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: {
      title: 'اتصل بنا',
      titleEn: 'Contact Us'
    }
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('@/views/HelpView.vue'),
    meta: {
      title: 'المساعدة',
      titleEn: 'Help'
    }
  },
  {
    path: '/sitemap',
    name: 'sitemap',
    component: () => import('@/views/SiteMapView.vue'),
    meta: {
      title: 'خريطة الموقع',
      titleEn: 'Site Map'
    }
  },
    {
    path: '/virtual-tour',
    name: 'virtual-tour',
    component: () => import('@/views/VirtualTourView.vue'),
    meta: {
      title: 'الجولة الافتراضية',
      titleEn: 'Virtual Tour'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: 'تسجيل الدخول',
      titleEn: 'Login'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'الملف الشخصي',
      titleEn: 'Profile',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'الصفحة غير موجودة',
      titleEn: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Navigation guard for authentication and page title
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth store if not already done
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Redirect authenticated users away from login page
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'profile' })
    return
  }

  // Update page title
  const lang = document.documentElement.lang || 'ar'
  const title = lang === 'ar' ? to.meta.title : to.meta.titleEn
  document.title = `${title} | المستودع الرقمي - مكتبة الملك فهد الوطنية`

  next()
})

export default router
