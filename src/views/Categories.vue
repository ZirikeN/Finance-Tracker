<template>
    <v-app id="inspire" class="categories-container">
        <FullScreenLoader
            :loading="categoriesStore.loading"
            title="Загрузка категорий"
            message="Получаем информацию о ваших категориях..."
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
            <v-app-bar-title class="font-bold gradient-text">
                🏷️ Управление категориями
            </v-app-bar-title>
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
                <!-- Карточка добавления категории -->
                <v-row class="mb-8">
                    <v-col cols="12" class="fade-in-up">
                        <v-card
                            class="category-card text-center pa-6"
                            @click="showAddCategoryDialog"
                        >
                            <v-icon size="64" color="primary" class="action-icon mb-4">
                                mdi-plus-circle
                            </v-icon>
                            <v-card-title class="text-h5 font-bold justify-center">
                                Добавить категорию
                            </v-card-title>
                            <v-card-subtitle class="text-body-1">
                                Создайте новую категорию для доходов или расходов
                            </v-card-subtitle>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Статистика категорий -->
                <v-row class="mb-8">
                    <v-col cols="12" md="3" class="fade-in-up">
                        <v-card class="stat-card count-card pa-4">
                            <v-card-text class="text-center">
                                <v-icon size="48" color="purple" class="mb-3"
                                    >mdi-tag-multiple</v-icon
                                >
                                <div class="text-h4 font-bold text-purple">
                                    {{ totalCategories }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    ВСЕГО КАТЕГОРИЙ
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-1">
                        <v-card class="stat-card income-card pa-4">
                            <v-card-text class="text-center">
                                <v-icon size="48" color="success" class="mb-3"
                                    >mdi-trending-up</v-icon
                                >
                                <div class="text-h4 font-bold text-success">
                                    {{ incomeCategories.length }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    КАТЕГОРИИ ДОХОДОВ
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-2">
                        <v-card class="stat-card expense-card pa-4">
                            <v-card-text class="text-center">
                                <v-icon size="48" color="error" class="mb-3"
                                    >mdi-trending-down</v-icon
                                >
                                <div class="text-h4 font-bold text-error">
                                    {{ expenseCategories.length }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    КАТЕГОРИИ РАСХОДОВ
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="3" class="fade-in-up delay-3">
                        <v-card class="stat-card pa-4" style="border-left: 4px solid #ff9800">
                            <v-card-text class="text-center">
                                <v-icon size="48" color="orange" class="mb-3"
                                    >mdi-account-edit</v-icon
                                >
                                <div class="text-h4 font-bold text-orange">
                                    {{ userCategoriesCount }}
                                </div>
                                <div class="text-caption font-medium text-medium-emphasis">
                                    ПОЛЬЗОВАТЕЛЬСКИХ
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Список категорий -->
                <v-row class="mb-6">
                    <!-- Категории доходов -->
                    <v-col cols="12" lg="6" class="fade-in-up">
                        <div class="category-type-card income-card pa-1">
                            <v-card-title class="d-flex align-center pa-4">
                                <v-avatar color="green-lighten-4" size="48" class="mr-3">
                                    <v-icon color="success" size="28">mdi-arrow-up</v-icon>
                                </v-avatar>
                                <div>
                                    <div class="text-h5 font-bold text-success">
                                        Категории доходов
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                        {{ incomeCategories.length }} категорий
                                    </div>
                                </div>
                            </v-card-title>

                            <v-card-text class="pa-4">
                                <v-list>
                                    <v-list-item
                                        v-for="category in incomeCategories"
                                        :key="category.name + category.type"
                                        class="category-item pa-4"
                                    >
                                        <template v-slot:prepend>
                                            <div
                                                class="category-icon"
                                                :style="{ backgroundColor: category.color + '20' }"
                                            >
                                                <v-icon :color="category.color" size="24">
                                                    {{ category.icon }}
                                                </v-icon>
                                            </div>
                                        </template>

                                        <v-list-item-title class="font-bold">
                                            {{ category.name }}
                                        </v-list-item-title>

                                        <v-list-item-subtitle>
                                            <v-chip
                                                :color="category.isDefault ? 'grey' : 'primary'"
                                                variant="flat"
                                                size="small"
                                            >
                                                {{
                                                    category.isDefault
                                                        ? 'Базовая'
                                                        : 'Пользовательская'
                                                }}
                                            </v-chip>
                                        </v-list-item-subtitle>

                                        <template v-slot:append>
                                            <v-btn
                                                v-if="!category.isDefault"
                                                icon
                                                size="small"
                                                color="error"
                                                @click="deleteCategory(category)"
                                                variant="text"
                                            >
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                            <v-icon v-else color="grey" size="small">
                                                mdi-lock
                                            </v-icon>
                                        </template>
                                    </v-list-item>
                                </v-list>

                                <div v-if="incomeCategories.length === 0" class="text-center py-6">
                                    <v-icon size="64" color="grey-lighten-2" class="mb-3"
                                        >mdi-tag-off</v-icon
                                    >
                                    <div class="text-h6 text-grey">Нет категорий доходов</div>
                                </div>
                            </v-card-text>
                        </div>
                    </v-col>

                    <!-- Категории расходов -->
                    <v-col cols="12" lg="6" class="fade-in-up delay-1">
                        <div class="category-type-card expense-card pa-1">
                            <v-card-title class="d-flex align-center pa-4">
                                <v-avatar color="red-lighten-4" size="48" class="mr-3">
                                    <v-icon color="error" size="28">mdi-arrow-down</v-icon>
                                </v-avatar>
                                <div>
                                    <div class="text-h5 font-bold text-error">
                                        Категории расходов
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                        {{ expenseCategories.length }} категорий
                                    </div>
                                </div>
                            </v-card-title>

                            <v-card-text class="pa-4">
                                <v-list>
                                    <v-list-item
                                        v-for="category in expenseCategories"
                                        :key="category.name + category.type"
                                        class="category-item pa-4"
                                    >
                                        <template v-slot:prepend>
                                            <div
                                                class="category-icon"
                                                :style="{ backgroundColor: category.color + '20' }"
                                            >
                                                <v-icon :color="category.color" size="24">
                                                    {{ category.icon }}
                                                </v-icon>
                                            </div>
                                        </template>

                                        <v-list-item-title class="font-bold">
                                            {{ category.name }}
                                        </v-list-item-title>

                                        <v-list-item-subtitle>
                                            <v-chip
                                                :color="category.isDefault ? 'grey' : 'primary'"
                                                variant="flat"
                                                size="small"
                                            >
                                                {{
                                                    category.isDefault
                                                        ? 'Базовая'
                                                        : 'Пользовательская'
                                                }}
                                            </v-chip>
                                        </v-list-item-subtitle>

                                        <template v-slot:append>
                                            <v-btn
                                                v-if="!category.isDefault"
                                                icon
                                                size="small"
                                                color="error"
                                                @click="deleteCategory(category)"
                                                variant="text"
                                            >
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                            <v-icon v-else color="grey" size="small">
                                                mdi-lock
                                            </v-icon>
                                        </template>
                                    </v-list-item>
                                </v-list>

                                <div v-if="expenseCategories.length === 0" class="text-center py-6">
                                    <v-icon size="64" color="grey-lighten-2" class="mb-3"
                                        >mdi-tag-off</v-icon
                                    >
                                    <div class="text-h6 text-grey">Нет категорий расходов</div>
                                </div>
                            </v-card-text>
                        </div>
                    </v-col>
                </v-row>

                <!-- Сообщение когда нет пользовательских категорий -->
                <v-row v-if="userCategoriesCount === 0 && !categoriesStore.loading">
                    <v-col cols="12" class="fade-in-up">
                        <v-card class="empty-state text-center pa-8">
                            <v-icon size="80" color="grey-lighten-1" class="mb-4"
                                >mdi-tag-plus</v-icon
                            >
                            <v-card-title class="text-h4 font-bold justify-center">
                                Создайте свои категории
                            </v-card-title>
                            <v-card-text>
                                <p class="text-body-1 mb-4">
                                    У вас пока нет пользовательских категорий.
                                </p>
                                <v-btn
                                    @click="showAddCategoryDialog"
                                    color="primary"
                                    size="large"
                                    class="gradient-btn"
                                >
                                    <v-icon class="mr-2">mdi-plus</v-icon>
                                    Добавить первую категорию
                                </v-btn>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <!-- Диалог добавления категории -->
        <v-dialog v-model="addCategoryDialog" max-width="500px" persistent>
            <v-card class="glass-card">
                <v-card-title class="headline font-bold">
                    {{ editingCategory ? '✏️ Редактировать категорию' : '➕ Добавить категорию' }}
                </v-card-title>

                <v-card-text class="pt-4">
                    <v-container>
                        <!-- Тип категории -->
                        <v-radio-group
                            v-model="newCategory.type"
                            inline
                            label="Тип категории"
                            class="mb-4"
                        >
                            <v-radio label="📈 Доход" value="income" color="success" />
                            <v-radio label="📉 Расход" value="expense" color="error" />
                        </v-radio-group>

                        <!-- Название категории -->
                        <v-text-field
                            v-model="newCategory.name"
                            label="Название категории"
                            :rules="[
                                (v) => !!v || 'Введите название категории',
                                (v) =>
                                    !isCategoryExists(v) ||
                                    'Категория с таким именем уже существует',
                            ]"
                            required
                            class="mb-4"
                            variant="outlined"
                        />

                        <!-- Цвет -->
                        <div class="mb-4">
                            <div class="text-caption text-medium-emphasis mb-2">
                                🎨 Цвет категории
                            </div>
                            <div class="color-picker-container">
                                <v-color-picker
                                    v-model="newCategory.color"
                                    mode="hexa"
                                    hide-inputs
                                    :swatches="colorSwatches"
                                    show-swatches
                                ></v-color-picker>
                            </div>
                        </div>

                        <!-- Иконка -->
                        <v-select
                            v-model="newCategory.icon"
                            :items="availableIcons"
                            label="Иконка"
                            :rules="[(v) => !!v || 'Выберите иконку']"
                            required
                            variant="outlined"
                        >
                            <template v-slot:item="{ item, props }">
                                <v-list-item v-bind="props">
                                    <template v-slot:prepend>
                                        <v-icon :color="newCategory.color">{{ item.value }}</v-icon>
                                    </template>
                                </v-list-item>
                            </template>
                            <template v-slot:selection="{ item }">
                                <v-icon :color="newCategory.color" class="mr-2">{{
                                    item.value
                                }}</v-icon>
                                {{ item.title }}
                            </template>
                        </v-select>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="closeDialog" color="grey" variant="text">Отмена</v-btn>
                    <v-btn
                        @click="saveCategory"
                        color="primary"
                        :loading="loading"
                        :disabled="!newCategory.name || isCategoryExists(newCategory.name)"
                        class="gradient-btn"
                    >
                        {{ editingCategory ? 'Обновить' : 'Добавить' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCategoriesStore } from '../stores/category'
import { useTheme } from 'vuetify'
import NavMenu from '../components/NavMenu.vue'
import FullScreenLoader from '../components/FullScreenLoader.vue'
import type { Category } from '@/types/category'

// Импорт стилей
import '@/assets/scss/categories.scss'

const drawer = ref<boolean | null>(false)
const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()
const theme = useTheme()
const addCategoryDialog = ref(false)
const loading = ref(false)
const editingCategory = ref<Category | null>(null)

const newCategory = reactive({
    name: '',
    color: '#1976D2',
    icon: 'mdi-tag',
    type: 'income' as 'income' | 'expense',
})

// Вычисляемые свойства
const incomeCategories = computed(() => categoriesStore.getCategoriesByType('income'))
const expenseCategories = computed(() => categoriesStore.getCategoriesByType('expense'))
const userCategoriesCount = computed(() => {
    return categoriesStore.categories.filter((cat) => !cat.isDefault).length
})
const totalCategories = computed(() => categoriesStore.categories.length)

// Проверка существования категории
const isCategoryExists = (name: string) => {
    return categoriesStore.categories.some(
        (cat) => cat.name.toLowerCase() === name.toLowerCase() && cat.type === newCategory.type
    )
}

// Цветовая палитра
const colorSwatches = [
    ['#FF6B6B', '#FF8E8E'],
    ['#4ECDC4', '#88D9D6'],
    ['#45B7D1', '#7BCDE5'],
    ['#96CEB4', '#B8E0C7'],
    ['#FFEAA7', '#FFEFC1'],
    ['#DDA0DD', '#E8BDE8'],
    ['#F8B195', '#FAC5AD'],
    ['#6A5ACD', '#8A7FF2'],
    ['#FFA726', '#FFB74D'],
    ['#26C6DA', '#4DD0E1'],
    ['#AB47BC', '#BA68C8'],
    ['#EC407A', '#F06292'],
]

// Доступные иконки
const availableIcons = [
    { title: 'Тег', value: 'mdi-tag' },
    { title: 'Еда', value: 'mdi-food' },
    { title: 'Машина', value: 'mdi-car' },
    { title: 'Дом', value: 'mdi-home' },
    { title: 'Больница', value: 'mdi-hospital' },
    { title: 'Кино', value: 'mdi-movie' },
    { title: 'Шоппинг', value: 'mdi-shopping' },
    { title: 'Спорт', value: 'mdi-dumbbell' },
    { title: 'Путешествия', value: 'mdi-airplane' },
    { title: 'Образование', value: 'mdi-school' },
    { title: 'Зарплата', value: 'mdi-briefcase' },
    { title: 'Подарок', value: 'mdi-gift' },
    { title: 'Инвестиции', value: 'mdi-chart-line' },
    { title: 'Счет', value: 'mdi-credit-card' },
    { title: 'Наличные', value: 'mdi-cash' },
    { title: 'Кофе', value: 'mdi-coffee' },
    { title: 'Интернет', value: 'mdi-wifi' },
    { title: 'Телефон', value: 'mdi-phone' },
    { title: 'Транспорт', value: 'mdi-bus' },
    { title: 'Такси', value: 'mdi-taxi' },
]

const showAddCategoryDialog = () => {
    editingCategory.value = null
    resetForm()
    addCategoryDialog.value = true
}

const resetForm = () => {
    newCategory.name = ''
    newCategory.color = '#1976D2'
    newCategory.icon = 'mdi-tag'
    newCategory.type = 'income'
}

const saveCategory = async () => {
    if (!newCategory.name || isCategoryExists(newCategory.name)) return

    loading.value = true
    try {
        if (editingCategory.value) {
            await categoriesStore.updateCategory(editingCategory.value.id!, newCategory)
        } else {
            await categoriesStore.addCategory(newCategory)
        }
        closeDialog()
    } catch (error: any) {
        console.error('Ошибка сохранения категории:', error)
        alert(error.message || 'Ошибка при сохранении категории')
    } finally {
        loading.value = false
    }
}

const deleteCategory = async (category: Category) => {
    if (!category.id || category.isDefault) return

    if (confirm(`Удалить категорию "${category.name}"?`)) {
        try {
            await categoriesStore.deleteCategory(category.id)
        } catch (error) {
            console.error('Ошибка удаления категории:', error)
            alert('Ошибка при удалении категории')
        }
    }
}

const closeDialog = () => {
    addCategoryDialog.value = false
    editingCategory.value = null
    resetForm()
}

const loadData = async () => {
    await categoriesStore.loadUserCategories()
}

onMounted(() => {
    loadData()

    if (localStorage.getItem('app-theme') === 'dark') {
        theme.global.name.value = 'dark'
    }
    if (categoriesStore.categories.length === 0) {
        categoriesStore.loadUserCategories()
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
</style>
