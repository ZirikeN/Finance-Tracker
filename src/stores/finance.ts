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

export const useFinanceStore = defineStore('finance', () => {
    const transactions = ref<any[]>([])
    const loading = ref(false)
    const authStore = useAuthStore()

    // Категории для доходов и расходов
    const categories = {
        income: [
            { name: 'Зарплата', color: '#4CAF50', icon: 'mdi-briefcase' },
            { name: 'Фриланс', color: '#8BC34A', icon: 'mdi-laptop' },
            { name: 'Инвестиции', color: '#CDDC39', icon: 'mdi-chart-line' },
            { name: 'Подарки', color: '#FFEB3B', icon: 'mdi-gift' },
            { name: 'Возврат долга', color: '#FFC107', icon: 'mdi-cash-clock' },
            { name: 'Прочее', color: '#FF9800', icon: 'mdi-dots-horizontal' },
        ],
        expense: [
            { name: 'Продукты', color: '#F44336', icon: 'mdi-cart' },
            { name: 'Транспорт', color: '#E91E63', icon: 'mdi-car' },
            { name: 'Жилье', color: '#9C27B0', icon: 'mdi-home' },
            { name: 'Развлечения', color: '#673AB7', icon: 'mdi-movie' },
            { name: 'Здоровье', color: '#3F51B5', icon: 'mdi-hospital' },
            { name: 'Одежда', color: '#2196F3', icon: 'mdi-hanger' },
            { name: 'Образование', color: '#03A9F4', icon: 'mdi-school' },
            { name: 'Рестораны', color: '#00BCD4', icon: 'mdi-food' },
            { name: 'Прочее', color: '#607D8B', icon: 'mdi-dots-horizontal' },
        ],
    }

    const loadTransactions = async () => {
        if (!authStore.user) return

        loading.value = true

        try {
            console.log('👤 User UID:', authStore.user.uid)

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

    // Получение цвета категории
    const getCategoryColor = (type: 'income' | 'expense', categoryName: string) => {
        const categoryList = type === 'income' ? categories.income : categories.expense
        const category = categoryList.find((cat) => cat.name === categoryName)
        return category ? category.color : type === 'income' ? '#4CAF50' : '#F44336'
    }

    return {
        transactions,
        loading,
        loadTransactions,
        addTransaction,
        deleteTransaction,
        categories,
        totalIncome,
        totalExpenses,
        balance,
        chartData,
        recentTransactions,
        getCategoryColor,
    }
})
