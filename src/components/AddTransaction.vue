<template>
    <v-card>
        <v-card-title class="headline"> Добавить операцию </v-card-title>

        <v-card-text>
            <v-form @submit.prevent="submit">
                <v-container>
                    <!-- Тип операции -->
                    <v-radio-group v-model="form.type" inline class="mb-4">
                        <v-radio label="Доход" value="income" color="success" />
                        <v-radio label="Расход" value="expense" color="error" />
                    </v-radio-group>

                    <!-- Категория -->
                    <v-select
                        v-model="form.category"
                        :items="availableCategories"
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

                    <!-- Остальные поля остаются без изменений -->
                    <v-text-field
                        v-model.number="form.amount"
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

                    <v-text-field
                        v-model="form.date"
                        label="Дата"
                        type="date"
                        :rules="[(v) => !!v || 'Выберите дату']"
                        required
                        class="mb-4"
                    />

                    <v-textarea
                        v-model="form.description"
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
            <v-btn @click="closeDialog" color="grey">Отмена</v-btn>
            <v-btn @click="submit" color="primary" :loading="loading"> Добавить </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useCategoriesStore } from '../stores/category'

const financeStore = useFinanceStore()
const categoriesStore = useCategoriesStore()
const loading = ref(false)

const form = ref({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
})

const availableCategories = computed(() => {
    const categoryList = categoriesStore.getCategoriesByType(form.value.type)
    return categoryList.map((cat) => ({
        title: cat.name,
        value: cat.name,
        color: cat.color,
        icon: cat.icon,
    }))
})

const getCategoryColor = (categoryName: string) => {
    return categoriesStore.getCategoryColor(form.value.type, categoryName)
}

const getCategoryIcon = (categoryName: string) => {
    return categoriesStore.getCategoryIcon(form.value.type, categoryName)
}

const submit = async () => {
    if (!form.value.category || form.value.amount <= 0) return

    loading.value = true
    try {
        const transactionData = {
            type: form.value.type,
            category: form.value.category,
            amount: Number(form.value.amount),
            date: new Date(form.value.date),
            description: form.value.description,
            color: getCategoryColor(form.value.category),
        }

        await financeStore.addTransaction(transactionData)
        emit('transaction-added')
        resetForm()
    } catch (error) {
        console.error('Ошибка при добавлении транзакции:', error)
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    form.value = {
        type: 'income',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
    }
}

const closeDialog = () => {
    resetForm()
    emit('close')
}

// Автоматически выбираем первую категорию при изменении типа
watch(
    () => form.value.type,
    (newType) => {
        const categories = categoriesStore.getCategoriesByType(newType)
        if (categories.length > 0) {
            form.value.category = categories[0].name
        }
    },
    { immediate: true }
)

const emit = defineEmits(['transaction-added', 'close'])
</script>
