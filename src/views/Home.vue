<template>
    <v-app id="inspire">
        <v-navigation-drawer v-model="drawer" class="custom-drawer">
            <v-list>
                <!-- Профиль пользователя -->
                <v-list-item prepend-icon="mdi-account" :title="authStore.user?.email" />

                <!-- Навигационные пункты -->
                <v-list-item
                    prepend-icon="mdi-home"
                    title="Главная"
                    value="home"
                    @click="$router.push('/home')"
                    class="nav-item"
                />
                <v-list-item
                    prepend-icon="mdi-finance"
                    title="Финансы"
                    value="finance"
                    class="nav-item"
                />
                <v-list-item
                    prepend-icon="mdi-chart-bar"
                    title="Отчеты"
                    value="reports"
                    class="nav-item"
                />
                <v-list-item
                    prepend-icon="mdi-cog"
                    title="Настройки"
                    value="settings"
                    class="nav-item"
                />

                <!-- Выход -->
                <v-list-item
                    prepend-icon="mdi-logout"
                    title="Выйти"
                    @click="handleLogout"
                    class="logout-btn"
                />
            </v-list>
        </v-navigation-drawer>

        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-app-bar-title>Finance Tracker</v-app-bar-title>
            <v-spacer></v-spacer>
            <div class="user-info">
                <v-icon icon="mdi-account-circle" class="mr-2" />
                <span>{{ authStore.user?.email }}</span>
            </div>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <v-row>
                    <v-col cols="12">
                        <v-card>
                            <v-card-title class="headline">
                                Добро пожаловать в Finance Tracker!
                            </v-card-title>
                            <v-card-text>
                                <p class="text-h6">Управляйте вашими финансами эффективно</p>

                                <v-row class="mt-4">
                                    <v-col cols="12" md="4">
                                        <v-card
                                            variant="outlined"
                                            class="text-center pa-4 action-card"
                                        >
                                            <v-icon size="48" color="primary">mdi-cash-plus</v-icon>
                                            <v-card-title class="text-h6"
                                                >Добавить операцию</v-card-title
                                            >
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-card
                                            variant="outlined"
                                            class="text-center pa-4 action-card"
                                        >
                                            <v-icon size="48" color="success">mdi-chart-pie</v-icon>
                                            <v-card-title class="text-h6">Отчеты</v-card-title>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-card
                                            variant="outlined"
                                            class="text-center pa-4 action-card"
                                        >
                                            <v-icon size="48" color="warning">mdi-cog</v-icon>
                                            <v-card-title class="text-h6">Настройки</v-card-title>
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <!-- Статистика (заглушка) -->
                                <v-row class="mt-6">
                                    <v-col cols="12" md="6">
                                        <v-card variant="outlined" class="pa-4">
                                            <v-card-title class="text-h6">
                                                <v-icon class="mr-2">mdi-wallet</v-icon>
                                                Баланс
                                            </v-card-title>
                                            <v-card-text>
                                                <p class="text-h4 text-primary">0 ₽</p>
                                                <p class="text-caption">Общий баланс</p>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-card variant="outlined" class="pa-4">
                                            <v-card-title class="text-h6">
                                                <v-icon class="mr-2">mdi-calendar</v-icon>
                                                Этот месяц
                                            </v-card-title>
                                            <v-card-text>
                                                <p class="text-h4 text-success">0 ₽</p>
                                                <p class="text-caption">Доходы</p>
                                                <p class="text-h4 text-error">0 ₽</p>
                                                <p class="text-caption">Расходы</p>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const drawer = ref<boolean | null>(false)
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async (): Promise<void> => {
    try {
        await authStore.logout()
        router.push('/')
        // После выхода router автоматически перенаправит на login
    } catch (error) {
        console.error('Logout error:', error)
    }
}

onMounted(() => {
    // Убедимся, что пользователь авторизован
    if (!authStore.user) {
        router.push('/')
    }
})
</script>

<style scoped>
.user-info {
    display: flex;
    align-items: center;
    margin-right: 16px;
}

.logout-btn:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.04);
}

.nav-item:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.04);
}

.custom-drawer {
    background-color: #f5f5f5;
}

.action-card:hover {
    cursor: pointer;
    background-color: #f5f5f5;
    transform: translateY(-2px);
    transition: all 0.3s ease;
}
</style>
