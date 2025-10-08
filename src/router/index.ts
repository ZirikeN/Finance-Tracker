import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('../views/Login.vue'),
            meta: { requiresGuest: true },
        },
        {
            path: '/home',
            name: 'home',
            component: () => import('../views/Home.vue'),
            meta: { requiresAuth: true },
        },
    ],
})

// Глобальная защита маршрутов
router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()

    // Если аутентификация еще не готова, жду
    if (!authStore.authIsReady) {
        await authStore.initAuth()
    }

    // Если маршрут требует авторизации
    if (to.meta.requiresAuth && !authStore.user) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }

    // Если маршрут только для гостей (неавторизованных)
    if (to.meta.requiresGuest && authStore.user) {
        return { name: 'home' }
    }

    return true
})

export default router
