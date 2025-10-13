<template>
    <v-app id="inspire">
        <v-navigation-drawer v-model="drawer" class="custom-drawer">
            <nav-menu></nav-menu>
        </v-navigation-drawer>

        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-app-bar-title>Finance Tracker</v-app-bar-title>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <auth-form />
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
