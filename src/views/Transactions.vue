<template>
    <v-app id="inspire">
        <FullScreenLoader
            :loading="financeStore.loading"
            title="Загрузка операций"
            message="Получаем информацию о ваших транзакциях..."
            :show-progress="true"
        />

        <v-navigation-drawer v-model="drawer" class="custom-drawer">
            <NavMenu></NavMenu>
        </v-navigation-drawer>

        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-app-bar-title>Все операции</v-app-bar-title>
            <v-spacer></v-spacer>

            <!-- Фильтры -->
            <div class="d-flex align-center" style="gap: 12px">
                <v-select
                    v-model="typeFilter"
                    :items="typeFilters"
                    density="compact"
                    variant="outlined"
                    style="min-width: 140px"
                    hide-details
                    placeholder="Все типы"
                    clearable
                />
                <v-text-field
                    v-model="searchQuery"
                    density="compact"
                    variant="outlined"
                    placeholder="Поиск..."
                    prepend-inner-icon="mdi-magnify"
                    style="min-width: 200px"
                    hide-details
                />
                <v-btn
                    @click="refreshTransactions"
                    variant="outlined"
                    :loading="financeStore.loading"
                >
                    <v-icon class="mr-2">mdi-refresh</v-icon>
                    Обновить
                </v-btn>
            </div>

            <div class="user-info ml-4">
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
                                <!-- Статистика -->
                                <v-row class="mb-6">
                                    <v-col cols="12" md="3">
                                        <v-card color="blue-lighten-5" variant="outlined">
                                            <v-card-text class="text-center">
                                                <div class="text-h5">
                                                    {{ filteredTransactions.length }}
                                                </div>
                                                <div class="text-caption">ВСЕГО ОПЕРАЦИЙ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="green-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-green">
                                                <div class="text-h5">
                                                    {{ formatCurrency(totalIncomeFiltered) }}
                                                </div>
                                                <div class="text-caption">ДОХОДЫ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="red-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-red">
                                                <div class="text-h5">
                                                    {{ formatCurrency(totalExpensesFiltered) }}
                                                </div>
                                                <div class="text-caption">РАСХОДЫ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="orange-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-orange">
                                                <div class="text-h5">
                                                    {{ formatCurrency(balanceFiltered) }}
                                                </div>
                                                <div class="text-caption">БАЛАНС</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <!-- Список операций -->
                                <v-card variant="outlined">
                                    <v-card-title class="d-flex justify-space-between align-center">
                                        <div>
                                            <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
                                            Список операций
                                        </div>
                                        <v-chip variant="outlined" color="primary">
                                            Показано: {{ filteredTransactions.length }} из
                                            {{ financeStore.transactions.length }}
                                        </v-chip>
                                    </v-card-title>

                                    <v-card-text>
                                        <v-list v-if="filteredTransactions.length > 0">
                                            <v-list-item
                                                v-for="transaction in filteredTransactions"
                                                :key="transaction.id"
                                                class="mb-2 transaction-item"
                                            >
                                                <template v-slot:prepend>
                                                    <v-icon
                                                        :color="
                                                            transaction.type === 'income'
                                                                ? 'success'
                                                                : 'error'
                                                        "
                                                        size="small"
                                                    >
                                                        {{
                                                            transaction.type === 'income'
                                                                ? 'mdi-arrow-up'
                                                                : 'mdi-arrow-down'
                                                        }}
                                                    </v-icon>
                                                </template>

                                                <v-list-item-title class="d-flex align-center">
                                                    <v-icon
                                                        :color="transaction.color"
                                                        size="small"
                                                        class="mr-3"
                                                    >
                                                        {{
                                                            financeStore.getCategoryIcon(
                                                                transaction.type,
                                                                transaction.category
                                                            )
                                                        }}
                                                    </v-icon>
                                                    <div>
                                                        <div class="font-weight-medium">
                                                            {{ transaction.category }}
                                                        </div>
                                                        <div
                                                            class="text-caption text-grey"
                                                            v-if="transaction.description"
                                                        >
                                                            {{ transaction.description }}
                                                        </div>
                                                    </div>
                                                </v-list-item-title>

                                                <v-list-item-subtitle>
                                                    <div>{{ formatDate(transaction.date) }}</div>
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
                                                            class="text-h6 font-weight-bold"
                                                        >
                                                            {{
                                                                transaction.type === 'income'
                                                                    ? '+'
                                                                    : '-'
                                                            }}
                                                            {{ formatCurrency(transaction.amount) }}
                                                        </div>
                                                        <div
                                                            class="d-flex justify-end mt-2"
                                                            style="gap: 8px"
                                                        >
                                                            <v-btn
                                                                icon
                                                                size="small"
                                                                color="primary"
                                                                @click="
                                                                    editTransaction(transaction)
                                                                "
                                                                variant="text"
                                                            >
                                                                <v-icon>mdi-pencil</v-icon>
                                                            </v-btn>
                                                            <v-btn
                                                                icon
                                                                size="small"
                                                                color="error"
                                                                @click="
                                                                    deleteTransaction(
                                                                        transaction.id
                                                                    )
                                                                "
                                                                variant="text"
                                                            >
                                                                <v-icon>mdi-delete</v-icon>
                                                            </v-btn>
                                                        </div>
                                                    </div>
                                                </template>
                                            </v-list-item>
                                        </v-list>

                                        <!-- Сообщение когда нет операций -->
                                        <div v-else class="text-center py-8">
                                            <v-icon size="64" color="grey-lighten-2" class="mb-4"
                                                >mdi-cash-remove</v-icon
                                            >
                                            <p class="text-h6 text-grey">Операции не найдены</p>
                                            <p class="text-grey">
                                                Попробуйте изменить параметры фильтрации
                                            </p>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <!-- Диалог редактирования операции -->
        <v-dialog v-model="editDialog" max-width="600px" persistent>
            <v-card>
                <v-card-title class="headline"> Редактировать операцию </v-card-title>

                <v-card-text>
                    <v-form @submit.prevent="saveTransaction">
                        <v-container>
                            <!-- Тип операции -->
                            <v-radio-group
                                v-model="editForm.type"
                                inline
                                class="mb-4"
                                label="Тип операции"
                            >
                                <v-radio label="Доход" value="income" color="success" />
                                <v-radio label="Расход" value="expense" color="error" />
                            </v-radio-group>

                            <!-- Категория -->
                            <v-select
                                v-model="editForm.category"
                                :items="availableEditCategories"
                                label="Категория"
                                :rules="[(v) => !!v || 'Выберите категорию']"
                                required
                                class="mb-4"
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
                            />

                            <!-- Дата -->
                            <v-text-field
                                v-model="editForm.date"
                                label="Дата"
                                type="date"
                                :rules="[(v) => !!v || 'Выберите дату']"
                                required
                                class="mb-4"
                            />

                            <!-- Описание -->
                            <v-textarea
                                v-model="editForm.description"
                                label="Описание"
                                rows="2"
                                class="mb-4"
                                placeholder="Необязательное описание операции"
                            />
                        </v-container>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="closeEditDialog" color="grey">Отмена</v-btn>
                    <v-btn
                        @click="saveTransaction"
                        color="primary"
                        :loading="editLoading"
                        :disabled="!editFormValid"
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
    { title: 'Все доходы', value: 'income' },
    { title: 'Все расходы', value: 'expense' },
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
    border-right: 1px solid #e0e0e0;
}

.user-info {
    display: flex;
    align-items: center;
}

.transaction-item {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: box-shadow 0.2s;
}

.transaction-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
