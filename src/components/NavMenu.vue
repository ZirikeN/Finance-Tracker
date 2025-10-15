<template>
    <v-list v-if="authStore.user">
        <v-list-item prepend-icon="mdi-wallet">{{
            formatCurrency(financeStore.balance)
        }}</v-list-item>

        <!-- Профиль пользователя -->
        <v-list-item prepend-icon="mdi-account" :title="authStore.user?.email || 'Пользователь'" />

        <!-- Навигационные пункты -->
        <v-list-item
            prepend-icon="mdi-home"
            title="Главная"
            value="home"
            @click="$router.push('/home')"
            class="nav-item"
        />
        <v-list-item
            prepend-icon="mdi-tag-multiple"
            title="Категории"
            value="categories"
            @click="router.push('/categories')"
        ></v-list-item>
        <v-list-item
            prepend-icon="mdi-format-list-bulleted"
            title="Все операции"
            value="transactions"
            @click="router.push('/transactions')"
        ></v-list-item>
        <v-list-item prepend-icon="mdi-finance" title="Финансы" value="finance" class="nav-item" />
        <v-list-item prepend-icon="mdi-chart-bar" title="Отчеты" value="reports" class="nav-item" />
        <v-list-item prepend-icon="mdi-cog" title="Настройки" value="settings" class="nav-item" />

        <v-list-item class="theme-toggle-item">
            <template v-slot:prepend>
                <v-icon>
                    {{
                        theme.global.name.value === 'light'
                            ? 'mdi-weather-sunny'
                            : 'mdi-weather-night'
                    }}
                </v-icon>
            </template>
            <v-list-item-title>Тема</v-list-item-title>
            <template v-slot:append>
                <v-switch
                    @click="toggleTheme"
                    :model-value="theme.global.name.value === 'dark'"
                    color="primary"
                    hide-details
                    density="compact"
                />
            </template>
        </v-list-item>

        <!-- Выход -->
        <v-list-item
            prepend-icon="mdi-logout"
            title="Выйти"
            @click="handleLogout"
            class="logout-btn"
        />
    </v-list>

    <v-list v-else>
        <v-list-item title="Войдите в систему" />

        <v-list-item class="theme-toggle-item">
            <template v-slot:prepend>
                <v-icon>
                    {{
                        theme.global.name.value === 'light'
                            ? 'mdi-weather-sunny'
                            : 'mdi-weather-night'
                    }}
                </v-icon>
            </template>
            <v-list-item-title>Тема</v-list-item-title>
            <template v-slot:append>
                <v-switch
                    @click="toggleTheme"
                    :model-value="theme.global.name.value === 'dark'"
                    color="primary"
                    hide-details
                    density="compact"
                />
            </template>
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

import { useFinanceStore } from '../stores/finance'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const financeStore = useFinanceStore()
const theme = useTheme()

const toggleTheme = () => {
    theme.global.name.value = theme.global.name.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('app-theme', theme.global.name.value)
}

const handleLogout = async (): Promise<void> => {
    try {
        await authStore.logout()
        financeStore.transactions = []
        router.push('/')
    } catch (error) {
        console.error('Logout error:', error)
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
    }).format(amount)
}

const loadData = async () => {
    await financeStore.loadTransactions()
}

onMounted(() => {
    loadData()
})
</script>

<style scoped>
.nav-item {
    cursor: pointer;
}

.logout-btn {
    cursor: pointer;
    color: #f44336;
}
</style>
