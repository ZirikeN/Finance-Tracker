import './assets/main.scss'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

const app = createApp(App)
const pinia = createPinia()

app.use(autoAnimatePlugin)
app.use(pinia)
app.use(router)
app.use(vuetify)

import { useAuthStore } from './stores/auth'
import { useCategoriesStore } from './stores/category'
const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()

// Инициализируем аутентификацию и затем категории
authStore.initAuth().then(() => {
    // Загружаем категории если пользователь авторизован
    if (authStore.user) {
        categoriesStore.loadUserCategories()
    }
    
    app.mount('#app')
})