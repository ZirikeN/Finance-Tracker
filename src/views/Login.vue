<template>
    <v-app id="inspire" class="auth-container">
        <!-- Декоративные элементы фона -->
        <div class="auth-background">
            <div class="bg-shape shape-1"></div>
            <div class="bg-shape shape-2"></div>
            <div class="bg-shape shape-3"></div>
            <div class="bg-shape shape-4"></div>
        </div>

        <v-navigation-drawer v-model="drawer" class="custom-drawer glass-card">
            <nav-menu></nav-menu>
        </v-navigation-drawer>

        <v-app-bar class="glass-card" elevation="0">
            <v-app-bar-nav-icon
                @click="drawer = !drawer"
                class="gradient-icon"
                size="large"
            ></v-app-bar-nav-icon>
            <v-app-bar-title class="font-bold gradient-text"> 💰 Finance Tracker </v-app-bar-title>
        </v-app-bar>

        <v-main>
            <v-container fluid class="auth-main-container">
                <div class="auth-content-wrapper">
                    <auth-form />
                </div>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '../stores/auth'

import AuthForm from '../components/AuthForm.vue'
import NavMenu from '../components/NavMenu.vue'

// Импорт стилей
import '@/assets/scss/auth.scss'

const drawer = ref<boolean | null>(false)
const router = useRouter()
const authStore = useAuthStore()
const theme = useTheme()

onMounted(() => {
    authStore.initAuth()
    // Если пользователь уже авторизован, перенаправляем на home
    if (authStore.user) {
        router.push('/home')
    }

    if (localStorage.getItem('app-theme') === 'dark') {
        theme.global.name.value = 'dark'
    }
})
</script>

<style scoped>
.auth-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.auth-main-container {
    padding: 0;
    height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-content-wrapper {
    width: 100%;
    max-width: 1200px;
    padding: 2rem;
}
</style>
