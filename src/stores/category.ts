import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from './auth'
import type { Category, UserCategories } from '../types/category'

export const useCategoriesStore = defineStore('categories', () => {
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const authStore = useAuthStore()

    // Базовые категории по умолчанию
    const defaultCategories: Category[] = [
        // Доходы
        {
            name: 'Зарплата',
            color: '#4CAF50',
            icon: 'mdi-briefcase',
            type: 'income',
            isDefault: true,
        },
        { name: 'Фриланс', color: '#8BC34A', icon: 'mdi-laptop', type: 'income', isDefault: true },
        {
            name: 'Инвестиции',
            color: '#CDDC39',
            icon: 'mdi-chart-line',
            type: 'income',
            isDefault: true,
        },
        { name: 'Подарки', color: '#FFEB3B', icon: 'mdi-gift', type: 'income', isDefault: true },
        {
            name: 'Возврат долга',
            color: '#FFC107',
            icon: 'mdi-cash-clock',
            type: 'income',
            isDefault: true,
        },
        {
            name: 'Прочее',
            color: '#FF9800',
            icon: 'mdi-dots-horizontal',
            type: 'income',
            isDefault: true,
        },

        // Расходы
        { name: 'Продукты', color: '#F44336', icon: 'mdi-cart', type: 'expense', isDefault: true },
        { name: 'Транспорт', color: '#E91E63', icon: 'mdi-car', type: 'expense', isDefault: true },
        { name: 'Жилье', color: '#9C27B0', icon: 'mdi-home', type: 'expense', isDefault: true },
        {
            name: 'Развлечения',
            color: '#673AB7',
            icon: 'mdi-movie',
            type: 'expense',
            isDefault: true,
        },
        {
            name: 'Здоровье',
            color: '#3F51B5',
            icon: 'mdi-hospital',
            type: 'expense',
            isDefault: true,
        },
        { name: 'Одежда', color: '#2196F3', icon: 'mdi-hanger', type: 'expense', isDefault: true },
        {
            name: 'Образование',
            color: '#03A9F4',
            icon: 'mdi-school',
            type: 'expense',
            isDefault: true,
        },
        { name: 'Рестораны', color: '#00BCD4', icon: 'mdi-food', type: 'expense', isDefault: true },
        {
            name: 'Прочее',
            color: '#607D8B',
            icon: 'mdi-dots-horizontal',
            type: 'expense',
            isDefault: true,
        },
    ]

    // Загрузка категорий пользователя
    const loadUserCategories = async () => {
        if (!authStore.user) return

        loading.value = true
        try {
            const q = query(
                collection(db, 'categories'),
                where('userId', '==', authStore.user.uid)
            )

            const querySnapshot = await getDocs(q)
            const userCategories: Category[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                userCategories.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                } as Category)
            })

            // Объединяем базовые категории с пользовательскими
            categories.value = [...defaultCategories, ...userCategories]
        } catch (error: any) {
            console.error('Ошибка загрузки категорий:', error)
            // В случае ошибки используем только базовые категории
            categories.value = defaultCategories
        } finally {
            loading.value = false
        }
    }

    // Добавление новой категории
    const addCategory = async (category: Omit<Category, 'id' | 'isDefault' | 'createdAt'>) => {
        if (!authStore.user) throw new Error('Пользователь не авторизован')

        const categoryData = {
            ...category,
            userId: authStore.user.uid,
            isDefault: false,
            createdAt: Timestamp.now(),
        }

        const docRef = await addDoc(collection(db, 'categories'), categoryData)

        const newCategory: Category = {
            id: docRef.id,
            ...categoryData,
        }

        categories.value.unshift(newCategory)
        return newCategory
    }

    // Обновление категории
    const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
        if (!authStore.user) throw new Error('Пользователь не авторизован')

        const categoryDoc = doc(db, 'categories', categoryId)
        await updateDoc(categoryDoc, updates)

        // Обновляем в локальном хранилище
        const index = categories.value.findIndex((cat) => cat.id === categoryId)
        if (index !== -1) {
            categories.value[index] = { ...categories.value[index], ...updates }
        }
    }

    // Удаление категории
    const deleteCategory = async (categoryId: string) => {
        if (!authStore.user) throw new Error('Пользователь не авторизован')

        await deleteDoc(doc(db, 'categories', categoryId))
        categories.value = categories.value.filter((cat) => cat.id !== categoryId)
    }

    // Получение категорий по типу
    const getCategoriesByType = computed(() => (type: 'income' | 'expense') => {
        return categories.value.filter((cat) => cat.type === type)
    })

    // Получение всех категорий (сгруппированных)
    const groupedCategories = computed(() => {
        return {
            income: categories.value.filter((cat) => cat.type === 'income'),
            expense: categories.value.filter((cat) => cat.type === 'expense'),
        }
    })

    // Получение цвета категории
    const getCategoryColor = (type: 'income' | 'expense', categoryName: string) => {
        const category = categories.value.find(
            (cat) => cat.type === type && cat.name === categoryName
        )
        return category ? category.color : type === 'income' ? '#4CAF50' : '#F44336'
    }

    // Получение иконки категории
    const getCategoryIcon = (type: 'income' | 'expense', categoryName: string) => {
        const category = categories.value.find(
            (cat) => cat.type === type && cat.name === categoryName
        )
        return category ? category.icon : 'mdi-dots-horizontal'
    }

    // Проверка, является ли категория пользовательской
    const isUserCategory = (categoryName: string, type: 'income' | 'expense') => {
        const category = categories.value.find(
            (cat) => cat.type === type && cat.name === categoryName
        )
        return category ? !category.isDefault : false
    }

    return {
        categories,
        loading,
        loadUserCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoriesByType,
        groupedCategories,
        getCategoryColor,
        getCategoryIcon,
        isUserCategory,
    }
})
