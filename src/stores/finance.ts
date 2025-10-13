import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    deleteDoc,
    doc,
    Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from './auth'
import { useCategoriesStore } from './category'

export const useFinanceStore = defineStore('finance', () => {
    const transactions = ref<any[]>([])
    const loading = ref(false)
    const authStore = useAuthStore()
    const categoriesStore = useCategoriesStore()

    const loadTransactions = async () => {
        if (!authStore.user) return

        loading.value = true

        try {
            if (categoriesStore.categories.length === 0) {
                await categoriesStore.loadUserCategories()
            }

            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', authStore.user.uid)
            )

            const querySnapshot = await getDocs(q)

            const loadedTransactions: any[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()

                loadedTransactions.push({
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate?.() || data.date,
                })
            })

            // ВАЖНО: Полностью заменяем массив
            transactions.value = loadedTransactions
        } catch (error: any) {
            console.error('ERROR:', error)
            console.error('Code:', error.code)
            console.error('Message:', error.message)
        } finally {
            loading.value = false
        }
    }

    const addTransaction = async (transaction: any) => {
        if (!authStore.user) throw new Error('No user')

        const transactionData = {
            ...transaction,
            userId: authStore.user.uid,
            date: Timestamp.fromDate(new Date(transaction.date)),
        }

        const docRef = await addDoc(collection(db, 'transactions'), transactionData)

        const newTransaction = {
            id: docRef.id,
            ...transaction,
            userId: authStore.user.uid,
        }

        transactions.value.unshift(newTransaction)
        return newTransaction
    }

    const deleteTransaction = async (transactionId: string) => {
        try {
            await deleteDoc(doc(db, 'transactions', transactionId))
            transactions.value = transactions.value.filter((t) => t.id !== transactionId)
        } catch (error) {
            console.error('Error deleting transaction:', error)
            throw error
        }
    }

    // Вычисляемые свойства для статистики
    const totalIncome = computed(() => {
        return transactions.value
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
    })

    const totalExpenses = computed(() => {
        return transactions.value
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
    })

    const balance = computed(() => totalIncome.value - totalExpenses.value)

    // Данные для круговой диаграммы
    const chartData = computed(() => {
        const incomeByCategory: { [key: string]: number } = {}
        const expenseByCategory: { [key: string]: number } = {}

        transactions.value.forEach((transaction) => {
            if (transaction.type === 'income') {
                incomeByCategory[transaction.category] =
                    (incomeByCategory[transaction.category] || 0) + transaction.amount
            } else {
                expenseByCategory[transaction.category] =
                    (expenseByCategory[transaction.category] || 0) + transaction.amount
            }
        })

        return {
            income: incomeByCategory,
            expenses: expenseByCategory,
        }
    })

    // Последние транзакции (5 штук)
    const recentTransactions = computed(() => {
        return transactions.value.slice(0, 10)
    })

    // Обновляем getCategoryColor для использования categoriesStore
    const getCategoryColor = (type: 'income' | 'expense', categoryName: string) => {
        return categoriesStore.getCategoryColor(type, categoryName)
    }

    // Добавляем получение иконки
    const getCategoryIcon = (type: 'income' | 'expense', categoryName: string) => {
        return categoriesStore.getCategoryIcon(type, categoryName)
    }

    return {
        transactions,
        loading,
        loadTransactions,
        addTransaction,
        deleteTransaction,
        categories: categoriesStore.groupedCategories,
        totalIncome,
        totalExpenses,
        balance,
        chartData,
        recentTransactions,
        getCategoryColor,
        getCategoryIcon,
    }
})
