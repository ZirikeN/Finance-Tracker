<template>
    <v-app id="inspire">
        <FullScreenLoader
            :loading="categoriesStore.loading"
            title="Загрузка категорий"
            message="Получаем информацию о ваших категориях..."
            :show-progress="true"
        />

        <v-navigation-drawer v-model="drawer" class="custom-drawer">
            <NavMenu></NavMenu>
        </v-navigation-drawer>

        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-app-bar-title>Управление категориями</v-app-bar-title>
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
                                <!-- Карточка добавления категории -->
                                <v-row class="mt-4">
                                    <v-col cols="12" md="12">
                                        <v-card
                                            variant="outlined"
                                            class="text-center pa-4 action-card"
                                            @click="showAddCategoryDialog"
                                        >
                                            <v-icon size="48" color="primary"
                                                >mdi-plus-circle</v-icon
                                            >
                                            <v-card-title class="text-h6"
                                                >Добавить категорию</v-card-title
                                            >
                                            <v-card-subtitle
                                                >Создайте новую категорию для доходов или
                                                расходов</v-card-subtitle
                                            >
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <!-- Статистика категорий -->
                                <v-row class="mt-6">
                                    <v-col cols="12" md="3">
                                        <v-card color="blue-lighten-5" variant="outlined">
                                            <v-card-text class="text-center">
                                                <div class="text-h5">{{ totalCategories }}</div>
                                                <div class="text-caption">ВСЕГО КАТЕГОРИЙ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="green-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-green">
                                                <div class="text-h5">
                                                    {{ incomeCategories.length }}
                                                </div>
                                                <div class="text-caption">КАТЕГОРИИ ДОХОДОВ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="red-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-red">
                                                <div class="text-h5">
                                                    {{ expenseCategories.length }}
                                                </div>
                                                <div class="text-caption">КАТЕГОРИИ РАСХОДОВ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-card color="orange-lighten-5" variant="outlined">
                                            <v-card-text class="text-center text-orange">
                                                <div class="text-h5">{{ userCategoriesCount }}</div>
                                                <div class="text-caption">ПОЛЬЗОВАТЕЛЬСКИХ</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <!-- Список категорий -->
                                <v-row class="mt-6">
                                    <!-- Категории доходов -->
                                    <v-col cols="12" lg="6">
                                        <v-card variant="outlined" class="h-100">
                                            <v-card-title class="text-success">
                                                <v-icon color="success" class="mr-2"
                                                    >mdi-arrow-up</v-icon
                                                >
                                                Категории доходов
                                            </v-card-title>
                                            <v-card-text>
                                                <v-list>
                                                    <v-list-item
                                                        v-for="category in incomeCategories"
                                                        :key="category.name + category.type"
                                                        class="mb-2"
                                                    >
                                                        <template v-slot:prepend>
                                                            <v-icon
                                                                :color="category.color"
                                                                class="mr-3"
                                                            >
                                                                {{ category.icon }}
                                                            </v-icon>
                                                        </template>

                                                        <v-list-item-title>
                                                            {{ category.name }}
                                                        </v-list-item-title>
                                                        <v-list-item-subtitle>
                                                            <v-chip
                                                                :color="category.color"
                                                                variant="outlined"
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
                                                            <v-icon
                                                                v-else
                                                                color="grey"
                                                                size="small"
                                                            >
                                                                mdi-lock
                                                            </v-icon>
                                                        </template>
                                                    </v-list-item>
                                                </v-list>

                                                <div
                                                    v-if="incomeCategories.length === 0"
                                                    class="text-center py-4 text-grey"
                                                >
                                                    <v-icon size="48" class="mb-2"
                                                        >mdi-tag-off</v-icon
                                                    >
                                                    <div>Нет категорий доходов</div>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>

                                    <!-- Категории расходов -->
                                    <v-col cols="12" lg="6">
                                        <v-card variant="outlined" class="h-100">
                                            <v-card-title class="text-error">
                                                <v-icon color="error" class="mr-2"
                                                    >mdi-arrow-down</v-icon
                                                >
                                                Категории расходов
                                            </v-card-title>
                                            <v-card-text>
                                                <v-list>
                                                    <v-list-item
                                                        v-for="category in expenseCategories"
                                                        :key="category.name + category.type"
                                                        class="mb-2"
                                                    >
                                                        <template v-slot:prepend>
                                                            <v-icon
                                                                :color="category.color"
                                                                class="mr-3"
                                                            >
                                                                {{ category.icon }}
                                                            </v-icon>
                                                        </template>

                                                        <v-list-item-title>
                                                            {{ category.name }}
                                                        </v-list-item-title>
                                                        <v-list-item-subtitle>
                                                            <v-chip
                                                                :color="category.color"
                                                                variant="outlined"
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
                                                            <v-icon
                                                                v-else
                                                                color="grey"
                                                                size="small"
                                                            >
                                                                mdi-lock
                                                            </v-icon>
                                                        </template>
                                                    </v-list-item>
                                                </v-list>

                                                <div
                                                    v-if="expenseCategories.length === 0"
                                                    class="text-center py-4 text-grey"
                                                >
                                                    <v-icon size="48" class="mb-2"
                                                        >mdi-tag-off</v-icon
                                                    >
                                                    <div>Нет категорий расходов</div>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <!-- Сообщение когда нет пользовательских категорий -->
                                <v-row
                                    class="mt-6"
                                    v-if="userCategoriesCount === 0 && !categoriesStore.loading"
                                >
                                    <v-col cols="12">
                                        <v-card variant="outlined" class="text-center pa-6">
                                            <v-icon size="64" color="grey-lighten-1" class="mb-4"
                                                >mdi-tag-plus</v-icon
                                            >
                                            <v-card-title class="text-h5"
                                                >Создайте свои категории</v-card-title
                                            >
                                            <v-card-text>
                                                <p class="text-body-1">
                                                    У вас пока нет пользовательских категорий.
                                                </p>
                                                <p class="text-body-2 text-grey">
                                                    Нажмите "Добавить категорию" чтобы создать свои
                                                    категории для лучшего отслеживания финансов
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

        <!-- Диалог добавления категории -->
        <v-dialog v-model="addCategoryDialog" max-width="500px">
            <v-card>
                <v-card-title class="headline">
                    {{ editingCategory ? 'Редактировать категорию' : 'Добавить категорию' }}
                </v-card-title>

                <v-card-text>
                    <v-container>
                        <!-- Тип категории -->
                        <v-radio-group
                            v-model="newCategory.type"
                            inline
                            label="Тип категории"
                            class="mb-4"
                        >
                            <v-radio label="Доход" value="income" color="success" />
                            <v-radio label="Расход" value="expense" color="error" />
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
                        />

                        <!-- Цвет -->
                        <div class="mb-4">
                            <div class="text-caption text-medium-emphasis mb-2">Цвет категории</div>
                            <v-color-picker
                                v-model="newCategory.color"
                                mode="hexa"
                                hide-inputs
                                :swatches="colorSwatches"
                                show-swatches
                            ></v-color-picker>
                        </div>

                        <!-- Иконка -->
                        <v-select
                            v-model="newCategory.icon"
                            :items="availableIcons"
                            label="Иконка"
                            :rules="[(v) => !!v || 'Выберите иконку']"
                            required
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
                    <v-btn @click="closeDialog" color="grey">Отмена</v-btn>
                    <v-btn
                        @click="saveCategory"
                        color="primary"
                        :loading="loading"
                        :disabled="!newCategory.name || isCategoryExists(newCategory.name)"
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
import { useFinanceStore } from '../stores/finance'
import { useTheme } from 'vuetify'
import NavMenu from '../components/NavMenu.vue'
import FullScreenLoader from '../components/FullScreenLoader.vue'
import type { Category } from '@/types/category'

const drawer = ref<boolean | null>(false)
const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()
const financeStore = useFinanceStore()
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
    ['#FF0000', '#AA0000'],
    ['#FF6D00', '#FF3D00'],
    ['#FFAB00', '#FF9100'],
    ['#FFD600', '#FFC400'],
    ['#64DD17', '#00C853'],
    ['#00E676', '#00B248'],
    ['#00B8D4', '#0091EA'],
    ['#2962FF', '#0039CB'],
    ['#304FFE', '#0026CA'],
    ['#6200EA', '#3100B3'],
    ['#AA00FF', '#7200CA'],
    ['#DD2C00', '#A30000'],
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
    // Загружаем категории если они еще не загружены
    if (categoriesStore.categories.length === 0) {
        categoriesStore.loadUserCategories()
    }
})
</script>

<style scoped>
.custom-drawer {
    border-right: 1px solid #e0e0e0;
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

.h-100 {
    height: 100%;
}
</style>
