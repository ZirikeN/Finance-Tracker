<template>
    <v-app id="inspire" class="transactions-container">
        <FullScreenLoader
            :loading="financeStore.loading"
            title="Загрузка операций"
            message="Получаем информацию о ваших транзакциях..."
            :show-progress="true"
        />

        <v-navigation-drawer v-model="drawer" class="custom-drawer glass-card" floating overlay temporary persistent>
            <NavMenu></NavMenu>
        </v-navigation-drawer>

        <v-app-bar class="glass-card" elevation="0">
            <v-app-bar-nav-icon
                @click="drawer = !drawer"
                class="gradient-icon"
                size="large"
            ></v-app-bar-nav-icon>
            <v-app-bar-title class="font-bold gradient-text"> 📋 Все операции </v-app-bar-title>
            <v-spacer></v-spacer>

            <div class="user-info ml-4">
                <v-avatar size="32" color="primary" class="mr-2">
                    <v-icon icon="mdi-account" color="white"></v-icon>
                </v-avatar>
                <span class="font-medium">{{ authStore.user?.email }}</span>
            </div>
        </v-app-bar>

        <v-main>
            <v-container fluid class="pa-4">
                <!-- Фильтры -->
                <div class="transaction-filters fade-in-up">
                    <v-row class="align-center">
                        <v-col cols="12" md="8">
                            <div class="d-flex align-center" style="gap: 16px">
                                <v-select
                                    v-model="typeFilter"
                                    :items="typeFilters"
                                    density="comfortable"
                                    variant="outlined"
                                    style="min-width: 160px"
                                    hide-details
                                    placeholder="Все типы"
                                    clearable
                                    class="filter-select"
                                />
                                <v-text-field
                                    v-model="searchQuery"
                                    density="comfortable"
                                    variant="outlined"
                                    placeholder="Поиск по категории или описанию..."
                                    prepend-inner-icon="mdi-magnify"
                                    style="min-width: 300px"
                                    hide-details
                                    class="search-field"
                                />
                            </div>
                        </v-col>
                        <v-col cols="12" md="4" class="text-right">
                            <v-btn
                                @click="refreshTransactions"
                                variant="flat"
                                :loading="financeStore.loading"
                                class="gradient-btn"
                            >
                                <v-icon class="mr-2">mdi-refresh</v-icon>
                                Обновить данные
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>

                <!-- Статистика -->
                <v-row class="mb-8">
                    <v-col cols="12" md="3" class="fade-in-up">
                        <div class="stats-grid">
                            <v-card class="stat-card-mini count-stat pa-4">
                                <v-card-text class="text-center">
                                    <v-icon size="40" color="purple" class="mb-2"
                                        >mdi-receipt</v-icon
                                    >
                                    <div class="text-h4 font-bold text-purple">
                                        {{ filteredTransactions.length }}
                                    </div>
                                    <div class="text-caption font-medium text-medium-emphasis">
                                        ВСЕГО ОПЕРАЦИЙ
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-1">
                        <div class="stats-grid">
                            <v-card class="stat-card-mini income-stat pa-4">
                                <v-card-text class="text-center">
                                    <v-icon size="40" color="success" class="mb-2"
                                        >mdi-trending-up</v-icon
                                    >
                                    <div class="text-h4 font-bold text-success">
                                        {{ formatCurrency(totalIncomeFiltered) }}
                                    </div>
                                    <div class="text-caption font-medium text-medium-emphasis">
                                        ДОХОДЫ
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-2">
                        <div class="stats-grid">
                            <v-card class="stat-card-mini expense-stat pa-4">
                                <v-card-text class="text-center">
                                    <v-icon size="40" color="error" class="mb-2"
                                        >mdi-trending-down</v-icon
                                    >
                                    <div class="text-h4 font-bold text-error">
                                        {{ formatCurrency(totalExpensesFiltered) }}
                                    </div>
                                    <div class="text-caption font-medium text-medium-emphasis">
                                        РАСХОДЫ
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-3">
                        <div class="stats-grid">
                            <v-card class="stat-card-mini balance-stat pa-4">
                                <v-card-text class="text-center">
                                    <v-icon
                                        size="40"
                                        :color="balanceFiltered >= 0 ? 'success' : 'error'"
                                        class="mb-2"
                                    >
                                        mdi-wallet
                                    </v-icon>
                                    <div
                                        class="text-h4 font-bold"
                                        :class="{
                                            'text-success': balanceFiltered > 0,
                                            'text-error': balanceFiltered < 0,
                                            'text-blue': balanceFiltered === 0,
                                        }"
                                    >
                                        {{ formatCurrency(balanceFiltered) }}
                                    </div>
                                    <div class="text-caption font-medium text-medium-emphasis">
                                        БАЛАНС
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-col>
                </v-row>

                <!-- Список операций -->
                <v-row>
                    <v-col cols="12" class="fade-in-up">
                        <div class="transaction-list">
                            <v-card-title class="d-flex justify-space-between align-center pa-6">
                                <div class="d-flex align-center">
                                    <v-icon class="mr-3 text-primary" size="32"
                                        >mdi-format-list-bulleted</v-icon
                                    >
                                    <div>
                                        <div class="text-h5 font-bold">Список операций</div>
                                        <div class="text-caption text-medium-emphasis">
                                            Все финансовые операции
                                        </div>
                                    </div>
                                </div>
                                <v-chip class="status-chip" color="primary" variant="flat">
                                    Показано: {{ filteredTransactions.length }} из
                                    {{ financeStore.transactions.length }}
                                </v-chip>
                            </v-card-title>

                            <v-card-text class="pa-0">
                                <v-list class="pa-4">
                                    <v-list-item
                                        v-for="transaction in filteredTransactions"
                                        :key="transaction.id"
                                        class="transaction-item-detailed pa-4"
                                    >
                                        <template v-slot:prepend>
                                            <div
                                                class="transaction-avatar"
                                                :style="{
                                                    backgroundColor:
                                                        transaction.type === 'income'
                                                            ? '#E8F5E8'
                                                            : '#FFEBEE',
                                                }"
                                            >
                                                <v-icon
                                                    :color="
                                                        transaction.type === 'income'
                                                            ? 'success'
                                                            : 'error'
                                                    "
                                                    size="28"
                                                >
                                                    {{
                                                        transaction.type === 'income'
                                                            ? 'mdi-arrow-up'
                                                            : 'mdi-arrow-down'
                                                    }}
                                                </v-icon>
                                            </div>
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
                                            <div class="d-flex align-center">
                                                <v-icon size="small" color="grey" class="mr-1"
                                                    >mdi-calendar</v-icon
                                                >
                                                {{ formatDate(transaction.date) }}
                                            </div>
                                            <div
                                                v-if="transaction.description"
                                                class="text-medium-emphasis mt-1"
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
                                                    class="text-h5 font-bold"
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
                                                    class="mt-2"
                                                >
                                                    {{
                                                        transaction.type === 'income'
                                                            ? 'Доход'
                                                            : 'Расход'
                                                    }}
                                                </v-chip>
                                                <div
                                                    class="d-flex justify-end mt-2"
                                                    style="gap: 8px"
                                                >
                                                    <v-btn
                                                        icon
                                                        size="small"
                                                        color="primary"
                                                        @click="editTransaction(transaction)"
                                                        variant="text"
                                                        class="action-btn"
                                                    >
                                                        <v-icon>mdi-pencil</v-icon>
                                                    </v-btn>
                                                    <v-btn
                                                        icon
                                                        size="small"
                                                        color="error"
                                                        @click="deleteTransaction(transaction.id)"
                                                        variant="text"
                                                        class="action-btn"
                                                    >
                                                        <v-icon>mdi-delete</v-icon>
                                                    </v-btn>
                                                </div>
                                            </div>
                                        </template>
                                    </v-list-item>
                                </v-list>

                                <!-- Сообщение когда нет операций -->
                                <div
                                    v-if="filteredTransactions.length === 0"
                                    class="text-center py-8"
                                >
                                    <v-icon size="80" color="grey-lighten-2" class="mb-4"
                                        >mdi-cash-remove</v-icon
                                    >
                                    <p class="text-h6 text-grey">Операции не найдены</p>
                                    <p class="text-grey mb-4">
                                        Попробуйте изменить параметры фильтрации
                                    </p>
                                    <v-btn
                                        @click="refreshTransactions"
                                        color="primary"
                                        variant="outlined"
                                    >
                                        <v-icon class="mr-2">mdi-refresh</v-icon>
                                        Обновить
                                    </v-btn>
                                </div>
                            </v-card-text>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <!-- Диалог редактирования операции -->
        <v-dialog v-model="editDialog" max-width="600px" persistent>
            <v-card class="glass-card">
                <v-card-title class="headline font-bold"> ✏️ Редактировать операцию </v-card-title>

                <v-card-text class="pt-4">
                    <v-form @submit.prevent="saveTransaction">
                        <v-container>
                            <!-- Тип операции -->
                            <v-radio-group
                                v-model="editForm.type"
                                inline
                                class="mb-4"
                                label="Тип операции"
                            >
                                <v-radio label="📈 Доход" value="income" color="success" />
                                <v-radio label="📉 Расход" value="expense" color="error" />
                            </v-radio-group>

                            <!-- Категория -->
                            <v-select
                                v-model="editForm.category"
                                :items="availableEditCategories"
                                label="Категория"
                                :rules="[(v) => !!v || 'Выберите категорию']"
                                required
                                class="mb-4"
                                variant="outlined"
                            >
                                <template v-slot:item="{ item, props }">
                                    <v-list-item v-bind="props">
                                        <template v-slot:prepend>
                                            <v-icon :color="getCategoryColor(item.value)">{{
                                                getCategoryIcon(item.value)
                                            }}</v-icon>
                                        </template>
                                    </v-list-item>
                                </template>
                                <template v-slot:selection="{ item }">
                                    <v-icon :color="getCategoryColor(item.value)" class="mr-2">{{
                                        getCategoryIcon(item.value)
                                    }}</v-icon>
                                    {{ item.title }}
                                </template>
                            </v-select>

                            <!-- Сумма -->
                            <v-text-field
                                v-model.number="editForm.amount"
                                label="Сумма"
                                type="number"
                                prefix="₽"
                                :rules="[
                                    (v) => !!v || 'Введите сумму',
                                    (v) => v > 0 || 'Сумма должна быть больше 0',
                                ]"
                                required
                                class="mb-4"
                                variant="outlined"
                            />

                            <!-- Дата -->
                            <v-text-field
                                v-model="editForm.date"
                                label="Дата"
                                type="date"
                                :rules="[(v) => !!v || 'Выберите дату']"
                                required
                                class="mb-4"
                                variant="outlined"
                            />

                            <!-- Описание -->
                            <v-textarea
                                v-model="editForm.description"
                                label="Описание"
                                rows="2"
                                class="mb-4"
                                placeholder="Необязательное описание операции"
                                variant="outlined"
                            />
                        </v-container>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="closeEditDialog" color="grey" variant="text">Отмена</v-btn>
                    <v-btn
                        @click="saveTransaction"
                        color="primary"
                        :loading="editLoading"
                        :disabled="!editFormValid"
                        class="gradient-btn"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useFinanceStore } from '../stores/finance'
import { useCategoriesStore } from '../stores/category'
import NavMenu from '../components/NavMenu.vue'
import FullScreenLoader from '../components/FullScreenLoader.vue'
import type { Transaction, TransactionForm } from '@/types/transaction'

// Импорт стилей
import '@/assets/scss/transactions.scss'

const drawer = ref<boolean | null>(false)
const authStore = useAuthStore()
const financeStore = useFinanceStore()
const categoriesStore = useCategoriesStore()

// Фильтры
const typeFilter = ref<string | null>(null)
const searchQuery = ref('')

// Редактирование
const editDialog = ref(false)
const editLoading = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const editForm = reactive<TransactionForm>({
    type: 'income',
    category: '',
    amount: 0,
    date: '',
    description: '',
})

const typeFilters = [
    { title: '📈 Все доходы', value: 'income' },
    { title: '📉 Все расходы', value: 'expense' },
]

// Доступные категории для редактирования
const availableEditCategories = computed(() => {
    const categoryList = categoriesStore.getCategoriesByType(editForm.type)
    return categoryList.map((cat) => ({
        title: cat.name,
        value: cat.name,
    }))
})

// Отфильтрованные транзакции
const filteredTransactions = computed(() => {
    let transactions = financeStore.allTransactions

    // Фильтр по типу
    if (typeFilter.value) {
        transactions = transactions.filter((t) => t.type === typeFilter.value)
    }

    // Поиск по описанию и категории
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        transactions = transactions.filter(
            (t) =>
                t.category.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
        )
    }

    return transactions
})

// Статистика для отфильтрованных данных
const totalIncomeFiltered = computed(() => {
    return filteredTransactions.value
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpensesFiltered = computed(() => {
    return filteredTransactions.value
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
})

const balanceFiltered = computed(() => totalIncomeFiltered.value - totalExpensesFiltered.value)

// Валидация формы редактирования
const editFormValid = computed(() => {
    return editForm.category && editForm.amount > 0 && editForm.date
})

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

const getCategoryColor = (categoryName: string) => {
    return financeStore.getCategoryColor(editForm.type, categoryName)
}

const getCategoryIcon = (categoryName: string) => {
    return financeStore.getCategoryIcon(editForm.type, categoryName)
}

const refreshTransactions = async () => {
    await financeStore.loadTransactions()
}

const editTransaction = (transaction: Transaction) => {
    editingTransaction.value = transaction
    editForm.type = transaction.type
    editForm.category = transaction.category
    editForm.amount = transaction.amount
    editForm.date = new Date(transaction.date).toISOString().split('T')[0]
    editForm.description = transaction.description || ''
    editDialog.value = true
}

const saveTransaction = async () => {
    if (!editingTransaction.value || !editFormValid.value) return

    editLoading.value = true
    try {
        const updates = {
            type: editForm.type,
            category: editForm.category,
            amount: Number(editForm.amount),
            date: new Date(editForm.date),
            description: editForm.description,
        }

        await financeStore.updateTransaction(editingTransaction.value.id, updates)
        closeEditDialog()
    } catch (error) {
        console.error('Ошибка при обновлении транзакции:', error)
        alert('Ошибка при сохранении изменений')
    } finally {
        editLoading.value = false
    }
}

const deleteTransaction = async (transactionId: string) => {
    if (confirm('Удалить эту транзакцию?')) {
        try {
            await financeStore.deleteTransaction(transactionId)
        } catch (error) {
            console.error('Ошибка удаления:', error)
            alert('Ошибка при удалении транзакции')
        }
    }
}

const closeEditDialog = () => {
    editDialog.value = false
    editingTransaction.value = null
    // Сброс формы
    editForm.type = 'income'
    editForm.category = ''
    editForm.amount = 0
    editForm.date = ''
    editForm.description = ''
}

// Автоматически выбираем первую категорию при изменении типа
watch(
    () => editForm.type,
    (newType) => {
        const categories = categoriesStore.getCategoriesByType(newType)
        if (categories.length > 0 && !editForm.category) {
            editForm.category = categories[0].name
        }
    }
)

onMounted(() => {
    if (financeStore.transactions.length === 0) {
        financeStore.loadTransactions()
    }
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

.filter-select,
.search-field {
    border-radius: 12px;
}

.action-btn {
    transition: all 0.2s ease;
}

.action-btn:hover {
    transform: scale(1.1);
}
</style>
