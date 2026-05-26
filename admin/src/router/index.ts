import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/pages/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: { title: '今日统计概览', requiresAuth: true },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/pages/Users.vue'),
        meta: { title: '人员管理', requiresAuth: true },
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/pages/Feedback.vue'),
        meta: { title: '意见反馈', requiresAuth: true },
      },
      {
        path: 'surveys',
        name: 'Surveys',
        component: () => import('@/pages/Surveys.vue'),
        meta: { title: '调查问卷', requiresAuth: true },
      },
      {
        path: 'reservations',
        name: 'Reservations',
        component: () => import('@/pages/Reservations.vue'),
        meta: { title: '预约管理/预订订单', requiresAuth: true },
      },
      {
        path: 'reservation-settings',
        name: 'ReservationSettings',
        component: () => import('@/pages/ReservationSettings.vue'),
        meta: { title: '预约时段规则设置', requiresAuth: true },
      },
      {
        path: 'orders',
        name: 'ConsumptionRecords',
        component: () => import('@/pages/ConsumptionRecords.vue'),
        meta: { title: '消费记录', requiresAuth: true },
      },
      {
        path: 'notices',
        name: 'Notices',
        component: () => import('@/pages/Notices.vue'),
        meta: { title: '通知公告', requiresAuth: true },
      },
      {
        path: 'dish-categories',
        name: 'DishCategories',
        component: () => import('@/pages/DishCategories.vue'),
        meta: { title: '菜品类别管理', requiresAuth: true },
      },
      {
        path: 'dishes',
        name: 'Dishes',
        component: () => import('@/pages/Dishes.vue'),
        meta: { title: '菜品管理', requiresAuth: true },
      },
      {
        path: 'dish-specs',
        name: 'DishSpecs',
        component: () => import('@/pages/DishSpecs.vue'),
        meta: { title: '菜品规格管理', requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn

  if (to.meta.requiresAuth !== false && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
