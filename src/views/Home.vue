<template>
    <v-app id="inspire" class="home-container">
        <FullScreenLoader
            :loading="financeStore.loading"
            title="Загрузка финансовых данных"
            message="Получаем информацию о ваших транзакциях..."
            subMessage="Это может занять несколько секунд"
            :show-progress="true"
        />

        <v-navigation-drawer v-model="drawer" class="custom-drawer glass-card" floating overlay temporary persistent>
            <NavMenu @close="drawer = false"></NavMenu>
        </v-navigation-drawer>

        <v-app-bar class="glass-card" elevation="0">
            <v-app-bar-nav-icon
                @click="drawer = !drawer"
                class="gradient-icon"
                size="large"
            ></v-app-bar-nav-icon>
            <v-app-bar-title class="font-bold gradient-text"> 💰 Finance Tracker </v-app-bar-title>
            <v-spacer></v-spacer>
            <div class="user-info">
                <v-avatar size="32" color="primary" class="mr-2">
                    <v-icon icon="mdi-account" color="white"></v-icon>
                </v-avatar>
                <span class="font-medium">{{ authStore.user?.email }}</span>
            </div>
        </v-app-bar>

        <v-main>
            <v-container fluid class="pa-4">
                <!-- Карточки действий -->
                <v-row class="mb-8">
                    <v-col cols="12" md="4" class="fade-in-up">
                        <v-card
                            class="action-card text-center pa-6"
                            @click="addTransactionDialog = true"
                        >
                            <v-icon size="64" color="success" class="action-icon mb-4">
                                mdi-plus-circle
                            </v-icon>
                            <v-card-title class="text-h5 font-bold justify-center">
                                Добавить операцию
                            </v-card-title>
                            <v-card-subtitle class="text-body-1">
                                Создать новую транзакцию
                            </v-card-subtitle>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="4" class="fade-in-up delay-1">
                        <v-card class="action-card text-center pa-6" @click="loadData">
                            <v-icon size="64" color="primary" class="action-icon mb-4">
                                mdi-refresh
                            </v-icon>
                            <v-card-title class="text-h5 font-bold justify-center">
                                Обновить данные
                            </v-card-title>
                            <v-card-subtitle class="text-body-1">
                                Синхронизировать информацию
                            </v-card-subtitle>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="4" class="fade-in-up delay-2">
                        <v-card
                            class="action-card text-center pa-6"
                            @click="router.push('/categories')"
                        >
                            <v-icon size="64" color="warning" class="action-icon mb-4">
                                mdi-tag-multiple
                            </v-icon>
                            <v-card-title class="text-h5 font-bold justify-center">
                                Категории
                            </v-card-title>
                            <v-card-subtitle class="text-body-1">
                                Управление категориями
                            </v-card-subtitle>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Диалог добавления операции -->
                <v-dialog v-model="addTransactionDialog" max-width="600px" persistent>
                    <AddTransaction
                        @transaction-added="handleTransactionAdded"
                        @close="addTransactionDialog = false"
                    />
                </v-dialog>

                <!-- Статистика -->
                <v-row class="mb-8">
                    <v-col cols="12" md="3" class="fade-in-up">
                        <v-card class="stat-card income-card pa-4">
                            <v-card-text class="text-center">
                                <v-icon size="48" color="success" class="mb-3"
                                    >mdi-trending-up</v-icon
                                >
                                <div class="text-h4 font-bold text-success">
                                    {{ formatCurrency(financeStore.totalIncome) }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    ОБЩИЕ ДОХОДЫ
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-1">
                        <v-card class="stat-card expense-card pa-4">
                            <v-card-text class="text-center">
                                <v-icon size="48" color="error" class="mb-3"
                                    >mdi-trending-down</v-icon
                                >
                                <div class="text-h4 font-bold text-error">
                                    {{ formatCurrency(financeStore.totalExpenses) }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    ОБЩИЕ РАСХОДЫ
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-2">
                        <v-card class="stat-card balance-card pa-4">
                            <v-card-text class="text-center">
                                <v-icon
                                    size="48"
                                    color="#2196f3"
                                    class="mb-3"
                                >
                                    mdi-wallet
                                </v-icon>
                                <div
                                    class="text-h4 font-bold"
                                    :class="{
                                        'text-success': financeStore.balance > 0,
                                        'text-error': financeStore.balance < 0,
                                        'text-grey': financeStore.balance === 0,
                                    }"
                                    style="color: #2196f3;"
                                >
                                    {{ formatCurrency(financeStore.balance) }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    ТЕКУЩИЙ БАЛАНС
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-3">
                        <v-card class="stat-card count-card pa-4">
                            <v-card-text class="text-center">
                                <v-icon size="48" color="purple" class="mb-3">mdi-receipt</v-icon>
                                <div class="text-h4 font-bold text-purple">
                                    {{ financeStore.transactions.length }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    ВСЕГО ОПЕРАЦИЙ
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Основной контент -->
                <v-row>
                    <!-- График -->
                    <v-col cols="12" lg="8" class="fade-in-up">
                        <div class="chart-container pa-4">
                            <FinanceChart :key="chartKey" />
                        </div>
                    </v-col>

                    <!-- Боковая панель с быстрой статистикой -->
                    <v-col cols="12" lg="4" class="fade-in-up delay-1">
                        <div class="quick-stats">
                            <v-card class="stat-item mb-4">
                                <v-card-title class="d-flex align-center">
                                    <v-icon class="mr-2 text-primary">mdi-wallet</v-icon>
                                    <span class="font-bold">Баланс</span>
                                </v-card-title>
                                <v-card-text>
                                    <p
                                        class="text-h3 font-bold"
                                        :class="{
                                            'text-success': financeStore.balance > 0,
                                            'text-error': financeStore.balance < 0,
                                            'text-grey': financeStore.balance === 0,
                                        }"
                                    >
                                        {{ formatCurrency(financeStore.balance) }}
                                    </p>
                                    <p class="text-caption text-medium-emphasis">Общий баланс</p>
                                </v-card-text>
                            </v-card>

                            <v-card class="stat-item">
                                <v-card-title class="d-flex align-center">
                                    <v-icon class="mr-2 text-green">mdi-calendar</v-icon>
                                    <span class="font-bold">Этот месяц</span>
                                </v-card-title>
                                <v-card-text>
                                    <div class="d-flex justify-space-between align-center mb-3">
                                        <div>
                                            <p class="text-h5 font-bold text-success">
                                                {{ formatCurrency(financeStore.totalIncome) }}
                                            </p>
                                            <p class="text-caption text-medium-emphasis">Доходы</p>
                                        </div>
                                        <v-icon color="success">mdi-arrow-up</v-icon>
                                    </div>
                                    <div class="d-flex justify-space-between align-center">
                                        <div>
                                            <p class="text-h5 font-bold text-error">
                                                {{ formatCurrency(financeStore.totalExpenses) }}
                                            </p>
                                            <p class="text-caption text-medium-emphasis">Расходы</p>
                                        </div>
                                        <v-icon color="error">mdi-arrow-down</v-icon>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-col>
                </v-row>

                <!-- Последние операции -->
                <v-row class="mt-6" v-if="financeStore.recentTransactions.length > 0">
                    <v-col cols="12" class="fade-in-up">
                        <div class="transaction-list">
                            <v-card-title class="d-flex justify-space-between align-center pa-6">
                                <div class="d-flex align-center">
                                    <v-icon class="mr-3 text-primary" size="32">mdi-history</v-icon>
                                    <div>
                                        <div class="text-h5 font-bold">Последние операции</div>
                                        <div class="text-caption text-medium-emphasis">
                                            Недавние финансовые операции
                                        </div>
                                    </div>
                                </div>
                                <v-chip class="status-chip" color="primary" variant="flat">
                                    Всего: {{ financeStore.transactions.length }}
                                </v-chip>
                            </v-card-title>

                            <v-card-text class="pa-0">
                                <v-list class="pa-4">
                                    <v-list-item
                                        v-for="transaction in financeStore.recentTransactions"
                                        :key="transaction.id"
                                        class="transaction-item pa-4"
                                    >
                                        <template v-slot:prepend>
                                            <v-avatar
                                                :color="
                                                    transaction.type === 'income'
                                                        ? 'green-lighten-4'
                                                        : 'red-lighten-4'
                                                "
                                                size="48"
                                                class="mr-4"
                                            >
                                                <v-icon
                                                    :color="
                                                        transaction.type === 'income'
                                                            ? 'success'
                                                            : 'error'
                                                    "
                                                >
                                                    {{
                                                        transaction.type === 'income'
                                                            ? 'mdi-arrow-up'
                                                            : 'mdi-arrow-down'
                                                    }}
                                                </v-icon>
                                            </v-avatar>
                                        </template>

                                        <v-list-item-title class="font-bold mb-1">
                                            <div class="d-flex align-center">
                                                <v-icon
                                                    :color="transaction.color"
                                                    size="small"
                                                    class="mr-2"
                                                >
                                                    mdi-circle
                                                </v-icon>
                                                {{ transaction.category }}
                                            </div>
                                        </v-list-item-title>

                                        <v-list-item-subtitle class="text-caption">
                                            <div>{{ formatDate(transaction.date) }}</div>
                                            <div
                                                v-if="transaction.description"
                                                class="text-medium-emphasis"
                                            >
                                                {{ transaction.description }}
                                            </div>
                                        </v-list-item-subtitle>

                                        <template v-slot:append>
                                            <div class="text-right">
                                                <div
                                                    :class="{
                                                        'text-success':
                                                            transaction.type === 'income',
                                                        'text-error':
                                                            transaction.type === 'expense',
                                                    }"
                                                    class="text-h6 font-bold"
                                                >
                                                    {{ transaction.type === 'income' ? '+' : '-' }}
                                                    {{ formatCurrency(transaction.amount) }}
                                                </div>
                                                <v-chip
                                                    size="small"
                                                    :color="
                                                        transaction.type === 'income'
                                                            ? 'green-lighten-4'
                                                            : 'red-lighten-4'
                                                    "
                                                    :text-color="
                                                        transaction.type === 'income'
                                                            ? 'green-darken-2'
                                                            : 'red-darken-2'
                                                    "
                                                    class="mt-1"
                                                >
                                                    {{
                                                        transaction.type === 'income'
                                                            ? 'Доход'
                                                            : 'Расход'
                                                    }}
                                                </v-chip>
                                                <v-btn
                                                    icon
                                                    size="small"
                                                    @click="deleteTransaction(transaction.id)"
                                                    color="error"
                                                    variant="text"
                                                    class="mt-2"
                                                >
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </div>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </div>
                    </v-col>
                </v-row>

                <!-- Сообщение когда нет транзакций -->
                <v-row
                    class="mt-6"
                    v-if="financeStore.transactions.length === 0 && !financeStore.loading"
                >
                    <v-col cols="12" class="fade-in-up">
                        <v-card class="glass-card text-center pa-8">
                            <v-icon size="80" color="grey-lighten-1" class="mb-4"
                                >mdi-cash-remove</v-icon
                            >
                            <v-card-title class="text-h4 font-bold justify-center">
                                Нет операций
                            </v-card-title>
                            <v-card-text>
                                <p class="text-body-1 mb-4">У вас еще нет финансовых операций.</p>
                                <v-btn
                                    @click="addTransactionDialog = true"
                                    color="primary"
                                    size="large"
                                    class="gradient-btn"
                                >
                                    <v-icon class="mr-2">mdi-plus</v-icon>
                                    Добавить первую операцию
                                </v-btn>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useFinanceStore } from '../stores/finance'
import { useCategoriesStore } from '../stores/category'
import { useTheme } from 'vuetify'

import FinanceChart from '../components/FinanceChart.vue'
import AddTransaction from '../components/AddTransaction.vue'
import FullScreenLoader from '../components/FullScreenLoader.vue'
import NavMenu from '../components/NavMenu.vue'

// Импорт стилей
import '@/assets/scss/home.scss'

const drawer = ref<boolean | null>(false)
const chartKey = ref(0)
const router = useRouter()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()
const financeStore = useFinanceStore()
const addTransactionDialog = ref(false)
const theme = useTheme()

const forceChartUpdate = () => {
    chartKey.value++
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
    }).format(amount)
}

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

const loadData = async () => {
    await financeStore.loadTransactions()
    await categoriesStore.loadUserCategories()
    setTimeout(forceChartUpdate, 100)
}

const handleTransactionAdded = async () => {
    addTransactionDialog.value = false
    await loadData()
}

const deleteTransaction = async (transactionId: string) => {
    if (confirm('Удалить эту транзакцию?')) {
        try {
            await financeStore.deleteTransaction(transactionId)
            await loadData()
        } catch (error) {
            console.error('Ошибка удаления:', error)
        }
    }
}

onMounted(() => {
    loadData()

    if (localStorage.getItem('app-theme') === 'dark') {
        theme.global.name.value = 'dark'
    }
})

onUnmounted(() => {
    chartKey.value = 0
})
</script>

<style scoped>
.custom-drawer {
    border-right: none;
}

.user-info {
    display: flex;
    align-items: center;
}
</style>
