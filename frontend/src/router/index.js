import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/views/Menu.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/menu/warm',
    name: 'MenuWarm',
    component: () => import('@/views/MenuWarm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/menu/blue',
    name: 'MenuBlue',
    component: () => import('@/views/MenuBlue.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/menu/green',
    name: 'MenuGreen',
    component: () => import('@/views/MenuGreen.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order-detail/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('@/views/Feedback.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/feedback-list',
    name: 'FeedbackList',
    component: () => import('@/views/FeedbackList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/surveys',
    name: 'Surveys',
    component: () => import('@/views/Surveys.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/survey/:id',
    name: 'SurveyDetail',
    component: () => import('@/views/SurveyDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notices',
    name: 'Notices',
    component: () => import('@/views/Notices.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notice/:id',
    name: 'NoticeDetail',
    component: () => import('@/views/NoticeDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/consumption',
    name: 'Consumption',
    component: () => import('@/views/Consumption.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/Notifications.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
