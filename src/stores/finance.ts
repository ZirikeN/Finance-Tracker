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
    updateDoc,
    doc,
    Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from './auth'
import { useCategoriesStore } from './category'
import type { Transaction } from '../types/transaction'

export const useFinanceStore = defineStore('finance', () => {
    const transactions = ref<Transaction[]>([])
    const loading = ref(false)
    const authStore = useAuthStore()
    const categoriesStore = useCategoriesStore()

    // Загрузка транзакций
    const loadTransactions = async () => {
        if (!authStore.user) return
        loading.value = true

        try {
            // Убедимся, что категории загружены
            if (categoriesStore.categories.length === 0) {
                await categoriesStore.loadUserCategories()
            }

            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', authStore.user.uid)
            )

            const querySnapshot = await getDocs(q)
            const loadedTransactions: Transaction[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                loadedTransactions.push({
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate?.() || data.date,
                } as Transaction)
            })

            loadedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            transactions.value = loadedTransactions
        } catch (error: any) {
            console.error('ERROR:', error)
        } finally {
            loading.value = false
        }
    }

    // Добавление транзакции
    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
        if (!authStore.user) throw new Error('No user')

        const transactionData = {
            ...transaction,
            userId: authStore.user.uid,
            date: Timestamp.fromDate(new Date(transaction.date)),
            color: categoriesStore.getCategoryColor(transaction.type, transaction.category),
        }

        const docRef = await addDoc(collection(db, 'transactions'), transactionData)

        const newTransaction: Transaction = {
            id: docRef.id,
            ...transactionData,
            date: new Date(transaction.date)
        }

        transactions.value.unshift(newTransaction)

        return newTransaction
    }

    // Обновление транзакции
    const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
        if (!authStore.user) throw new Error('No user')

        const updateData = { ...updates }

        // Если обновляется дата, конвертируем в Timestamp
        if (updates.date) {
            updateData.date = Timestamp.fromDate(new Date(updates.date))
        }

        // Если обновляется категория или тип, обновляем цвет
        if (updates.category && updates.type) {
            updateData.color = categoriesStore.getCategoryColor(updates.type, updates.category)
        }

        const transactionDoc = doc(db, 'transactions', transactionId)
        await updateDoc(transactionDoc, updateData)

        // Обновляем в локальном хранилище
        const index = transactions.value.findIndex((t) => t.id === transactionId)
        if (index !== -1) {
            transactions.value[index] = {
                ...transactions.value[index],
                ...updates,
                color: updates.color || transactions.value[index].color,
            }
        }
    }

    // Удаление транзакции
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

    // Последние транзакции (10 штук)
    const recentTransactions = computed(() => {
        return transactions.value.slice(0, 10)
    })

    // Все транзакции (для страницы всех операций)
    const allTransactions = computed(() => {
        return transactions.value
    })

    // Получение цвета категории
    const getCategoryColor = (type: 'income' | 'expense', categoryName: string) => {
        return categoriesStore.getCategoryColor(type, categoryName)
    }

    // Получение иконки категории
    const getCategoryIcon = (type: 'income' | 'expense', categoryName: string) => {
        return categoriesStore.getCategoryIcon(type, categoryName)
    }

    return {
        transactions,
        loading,
        loadTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories: categoriesStore.groupedCategories,
        totalIncome,
        totalExpenses,
        balance,
        chartData,
        recentTransactions,
        allTransactions,
        getCategoryColor,
        getCategoryIcon,
    }
})
