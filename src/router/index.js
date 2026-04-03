import { createRouter, createWebHistory } from 'vue-router'
import { storeToRefs } from 'pinia'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'
import { useUserStore } from '@/stores/user'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Главная' }
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
    }
  ],
})

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  const { isAdmin } = storeToRefs(userStore)

  const publicRoutes = ['/login', '/']

  if (publicRoutes.includes(to.path)) {
    return true
  }
  if (!isAdmin.value) {
    return { name: 'home' }
  }
  return true
})


export default router
