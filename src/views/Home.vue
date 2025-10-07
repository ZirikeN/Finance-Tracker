<template>
    <v-app id="inspire">
        <v-navigation-drawer v-model="drawer" class="custom-drawer">
            <div v-if="authStore.user">
                <v-list>
                    <v-list-item prepend-icon="mdi-account" :title="authStore.user.email" />
                    <v-list-item
                        prepend-icon="mdi-logout"
                        title="Выйти"
                        @click="handleLogout"
                        class="logout-btn"
                    />
                </v-list>
            </div>
            <div v-else>
                <v-list>
                    <v-list-item title="Войдите в систему" />
                </v-list>
            </div>
        </v-navigation-drawer>

        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-app-bar-title>Finance Tracker</v-app-bar-title>
            <v-spacer></v-spacer>
            <div v-if="authStore.user" class="user-info">
                <v-icon icon="mdi-account-circle" class="mr-2" />
                <span>{{ authStore.user.email }}</span>
            </div>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <!-- Компонент регистрации/входа -->
                <auth-form v-if="!authStore.user" />

                <!-- Основной контент приложения -->
                <div v-else>
                    <h2>Добро пожаловать в Finance Tracker!</h2>
                    <p>Здесь будет ваш основной контент для управления финансами</p>
                </div>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import AuthForm from '../components/AuthForm.vue'

const drawer = ref<boolean | null>(false)
const authStore = useAuthStore()

const handleLogout = async (): Promise<void> => {
    try {
        await authStore.logout()
    } catch (error) {
        console.error('Logout error:', error)
    }
}

onMounted(() => {
    authStore.initAuth()
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

.custom-drawer {
    background-color: #f5f5f5;
}
</style>
