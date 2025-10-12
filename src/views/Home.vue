<template>
    <v-app id="inspire">
        <FullScreenLoader
            :loading="financeStore.loading"
            title="Загрузка финансовых данных"
            message="Получаем информацию о ваших транзакциях..."
            subMessage="Это может занять несколько секунд"
            :show-progress="true"
        />

        <v-navigation-drawer v-model="drawer" class="custom-drawer">
            <NavMenu></NavMenu>
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
                            <v-card-text>
                                <!-- Карточки действий -->
                                <v-row class="mt-4">
                                    <v-col cols="12" md="4">
                                        <v-card
                                            variant="outlined"
                                            class="text-center pa-4 action-card"
                                            @click="addTransactionDialog = true"
                                        >
                                            <v-icon size="48" color="success"
                                                >mdi-plus-circle</v-icon
                                            >
                                            <v-card-title class="text-h6"
                                                >Добавить операцию</v-card-title
                                            >
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-card
                                            variant="outlined"
                                            class="text-center pa-4 action-card"
                                            @click="loadData"
                                        >
                                            <v-icon size="48" color="primary">mdi-refresh</v-icon>
                                            <v-card-title class="text-h6"
                                                >Обновить данные</v-card-title
                                            >
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

                                <!-- Диалог добавления операции -->
                                <v-dialog v-model="addTransactionDialog" max-width="600px">
                                    <AddTransaction
                                        @transaction-added="handleTransactionAdded"
                                        @close="addTransactionDialog = false"
                                    />
                                </v-dialog>

                                <!-- Статистика -->
                                <v-row class="mt-6">
                                    <v-col cols="12" md="3">
                                        <v-card color="green-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-green">
                                                <div class="text-h5">
                                                    {{ formatCurrency(financeStore.totalIncome) }}
                                                </div>
                                                <div class="text-caption">ОБЩИЕ ДОХОДЫ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="red-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-red">
                                                <div class="text-h5">
                                                    {{ formatCurrency(financeStore.totalExpenses) }}
                                                </div>
                                                <div class="text-caption">ОБЩИЕ РАСХОДЫ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card
                                            :color="
                                                financeStore.balance >= 0
                                                    ? 'blue-lighten-5'
                                                    : 'orange-lighten-5'
                                            "
                                            variant="outlined"
                                        >
                                            <v-card-text class="text-center text-blue">
                                                <div class="text-h5">
                                                    {{ formatCurrency(financeStore.balance) }}
                                                </div>
                                                <div class="text-caption">БАЛАНС</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="grey-lighten-4" variant="outlined">
                                            <v-card-text class="text-center text-grey">
                                                <div class="text-h5">
                                                    {{ financeStore.transactions.length }}
                                                </div>
                                                <div class="text-caption">ВСЕГО ОПЕРАЦИЙ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <!-- График и последние операции -->
                                <v-row class="mt-6">
                                    <!-- Круговая диаграмма (Донут) -->
                                    <v-col cols="12" lg="8">
                                        <FinanceChart />
                                    </v-col>

                                    <!-- Последние операции -->
                                    <v-col cols="12" lg="4">
                                        <v-row>
                                            <v-col cols="12">
                                                <v-card variant="outlined" class="pa-4">
                                                    <v-card-title class="text-h6">
                                                        <v-icon class="mr-2">mdi-wallet</v-icon>
                                                        Баланс
                                                    </v-card-title>
                                                    <v-card-text>
                                                        <p
                                                            class="text-h4"
                                                            :class="{
                                                                'text-success':
                                                                    financeStore.balance > 0,
                                                                'text-error':
                                                                    financeStore.balance < 0,
                                                                'text-grey':
                                                                    financeStore.balance === 0,
                                                            }"
                                                        >
                                                            {{
                                                                formatCurrency(financeStore.balance)
                                                            }}
                                                        </p>
                                                        <p class="text-caption">Общий баланс</p>
                                                    </v-card-text>
                                                </v-card>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-card variant="outlined" class="pa-4">
                                                    <v-card-title class="text-h6">
                                                        <v-icon class="mr-2">mdi-calendar</v-icon>
                                                        Этот месяц
                                                    </v-card-title>
                                                    <v-card-text>
                                                        <p class="text-h4 text-success">
                                                            {{
                                                                formatCurrency(
                                                                    financeStore.totalIncome
                                                                )
                                                            }}
                                                        </p>
                                                        <p class="text-caption">Доходы</p>
                                                        <p class="text-h4 text-error">
                                                            {{
                                                                formatCurrency(
                                                                    financeStore.totalExpenses
                                                                )
                                                            }}
                                                        </p>
                                                        <p class="text-caption">Расходы</p>
                                                    </v-card-text>
                                                </v-card>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>

                                <!-- Список последних транзакций -->
                                <v-row
                                    class="mt-6"
                                    v-if="financeStore.recentTransactions.length > 0"
                                >
                                    <v-col cols="12">
                                        <v-card variant="outlined">
                                            <v-card-title
                                                class="d-flex justify-space-between align-center"
                                            >
                                                <div>
                                                    <v-icon class="mr-2">mdi-history</v-icon>
                                                    Последние операции
                                                </div>
                                                <v-chip variant="outlined" color="primary">
                                                    Всего: {{ financeStore.transactions.length }}
                                                </v-chip>
                                            </v-card-title>
                                            <v-card-text>
                                                <ul v-auto-animate>
                                                    <v-list-item
                                                        v-for="transaction in financeStore.recentTransactions"
                                                        :key="transaction.id"
                                                    >
                                                        <template v-slot:prepend>
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
                                                        </template>

                                                        <v-list-item-title>
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
                                                        <v-list-item-subtitle>
                                                            <div>
                                                                {{ formatDate(transaction.date) }}
                                                            </div>
                                                            <div v-if="transaction.description">
                                                                {{ transaction.description }}
                                                            </div>
                                                        </v-list-item-subtitle>

                                                        <template v-slot:append>
                                                            <div class="text-right">
                                                                <div
                                                                    :class="{
                                                                        'text-success':
                                                                            transaction.type ===
                                                                            'income',
                                                                        'text-error':
                                                                            transaction.type ===
                                                                            'expense',
                                                                    }"
                                                                    class="text-h6"
                                                                >
                                                                    {{
                                                                        transaction.type ===
                                                                        'income'
                                                                            ? '+'
                                                                            : '-'
                                                                    }}
                                                                    {{
                                                                        formatCurrency(
                                                                            transaction.amount
                                                                        )
                                                                    }}
                                                                </div>
                                                                <div class="text-caption text-grey">
                                                                    {{
                                                                        transaction.type ===
                                                                        'income'
                                                                            ? 'Доход'
                                                                            : 'Расход'
                                                                    }}
                                                                </div>
                                                                <v-btn
                                                                    icon
                                                                    size="small"
                                                                    @click="
                                                                        deleteTransaction(
                                                                            transaction.id
                                                                        )
                                                                    "
                                                                    color="error"
                                                                    class="mt-1"
                                                                >
                                                                    <v-icon>mdi-delete</v-icon>
                                                                </v-btn>
                                                            </div>
                                                        </template>
                                                    </v-list-item>
                                                </ul>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <!-- Сообщение когда нет транзакций -->
                                <v-row
                                    class="mt-6"
                                    v-if="
                                        financeStore.transactions.length === 0 &&
                                        !financeStore.loading
                                    "
                                >
                                    <v-col cols="12">
                                        <v-card variant="outlined" class="text-center pa-6">
                                            <v-icon size="64" color="grey-lighten-1" class="mb-4"
                                                >mdi-cash-remove</v-icon
                                            >
                                            <v-card-title class="text-h5"
                                                >Нет операций</v-card-title
                                            >
                                            <v-card-text>
                                                <p class="text-body-1">
                                                    У вас еще нет финансовых операций.
                                                </p>
                                                <p class="text-body-2 text-grey">
                                                    Нажмите "Добавить операцию" чтобы начать
                                                    отслеживать финансы
                                                </p>
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
import { useFinanceStore } from '../stores/finance'
import { useTheme } from 'vuetify'

import FinanceChart from '../components/FinanceChart.vue'
import AddTransaction from '../components/AddTransaction.vue'
import FullScreenLoader  from '../components/FullScreenLoader.vue'
import NavMenu from '../components/NavMenu.vue'

const drawer = ref<boolean | null>(false)
const router = useRouter()
const authStore = useAuthStore()
const financeStore = useFinanceStore()
const addTransactionDialog = ref(false)
const theme = useTheme()

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
}

const handleTransactionAdded = () => {
    addTransactionDialog.value = false
}

const deleteTransaction = async (transactionId: string) => {
    if (confirm('Удалить эту транзакцию?')) {
        try {
            await financeStore.deleteTransaction(transactionId)
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
</script>

<style scoped>
.custom-drawer {
    border-right: 1px solid #e0e0e0;
}

.nav-item {
    cursor: pointer;
    transition: background-color 0.3s;
}

.nav-item:hover {
    background-color: #f5f5f5;
}

.logout-btn {
    cursor: pointer;
    color: #f44336;
}

.action-card {
    cursor: pointer;
    transition: transform 0.2s;
    height: 100%;
}

.action-card:hover {
    transform: translateY(-2px);
}

.user-info {
    display: flex;
    align-items: center;
}
</style>
