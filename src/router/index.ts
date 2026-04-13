import { createRouter, createWebHistory } from 'vue-router'
import type { NavigationGuardReturn, RouteRecordRaw } from 'vue-router'
import { storeToRefs } from 'pinia'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores/user'

const LoginView = () => import('../views/LoginView.vue')
const AdminView = () => import('../views/AdminView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Главная' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to): NavigationGuardReturn => {
  const userStore = useUserStore()
  const { isAdmin } = storeToRefs(userStore)
  const publicRoutes = ['/', '/login']

  if (publicRoutes.includes(to.path)) {
    return true
  }
  if (!isAdmin.value) {
    return { name: 'home' }
  }
  return true
})

export default router
