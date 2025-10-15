<template>
    <v-card variant="outlined">
        <v-card-title class="d-flex justify-space-between align-center">
            <div>
                <v-icon class="mr-2">mdi-chart-donut</v-icon>
                Финансовая статистика
            </div>
            <div class="d-flex align-center" style="gap: 8px">
                <v-select
                    v-model="chartFilter"
                    :items="chartFilters"
                    density="compact"
                    variant="outlined"
                    style="min-width: 140px"
                    hide-details
                    @update:model-value="handleFilterChange"
                />
                <v-select
                    v-model="periodFilter"
                    :items="periodFilters"
                    density="compact"
                    variant="outlined"
                    style="min-width: 140px"
                    hide-details
                    @update:model-value="handleFilterChange"
                />
                <v-text-field
                    v-if="periodFilter === 'custom'"
                    v-model="selectedDate"
                    label="Выбрать дату"
                    type="date"
                    density="compact"
                    variant="outlined"
                    style="min-width: 150px"
                    hide-details
                    :max="new Date().toISOString().split('T')[0]"
                    @change="handleFilterChange"
                />
            </div>
        </v-card-title>

        <v-card-text>
            <v-alert v-if="filterInfo" type="info" density="compact" class="mb-4">
                {{ filterInfo }}
            </v-alert>

            <div class="chart-wrapper">
                <canvas v-if="hasData" ref="chartCanvas"></canvas>

                <div v-if="hasData" class="chart-center-text">
                    <div class="center-amount">{{ formatCurrency(centerAmount) }}</div>
                    <div class="center-label">{{ centerLabel }}</div>
                </div>

                <div v-else class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-chart-donut</v-icon>
                    <p class="text-h6 text-grey">Нет данных для отображения</p>
                    <p class="text-grey">Добавьте транзакции или измените параметры фильтрации</p>
                </div>
            </div>

            <!-- Легенда -->
            <div v-if="hasData && chartData.labels.length > 0" class="mt-4">
                <v-divider class="mb-4"></v-divider>
                <div class="legend-container">
                    <v-chip
                        v-for="(label, index) in chartData.labels"
                        :key="index"
                        :color="chartData.backgroundColor[index]"
                        variant="outlined"
                        class="ma-1"
                        size="small"
                    >
                        <v-icon :color="chartData.backgroundColor[index]" size="small" class="mr-1">
                            mdi-circle
                        </v-icon>
                        {{ label }} - {{ formatCurrency(chartData.data[index]) }}
                    </v-chip>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const financeStore = useFinanceStore()
const chartCanvas = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)
const isMounted = ref(false)

// Фильтры
const chartFilter = ref('all')
const periodFilter = ref('all')
const selectedDate = ref('')

const chartFilters = [
    { title: 'Все операции', value: 'all' },
    { title: 'Только доходы', value: 'income' },
    { title: 'Только расходы', value: 'expense' },
]

const periodFilters = [
    { title: 'За всё время', value: 'all' },
    { title: 'Сегодня', value: 'today' },
    { title: 'За неделю', value: 'week' },
    { title: 'За месяц', value: 'month' },
    { title: 'Конкретный день', value: 'custom' },
]

// Фильтрация транзакций по периоду
const getFilteredTransactions = () => {
    let transactions = financeStore.transactions

    if (periodFilter.value === 'all') {
        return transactions
    }

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (periodFilter.value) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            break
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            break
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            break
        case 'custom':
            if (!selectedDate.value) return transactions
            startDate = new Date(selectedDate.value)
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
            break
        default:
            return transactions
    }

    return transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate && transactionDate < endDate
    })
}

// Подготовка данных для графика
const getChartData = () => {
    const filteredTransactions = getFilteredTransactions()
    let data: { [key: string]: number } = {}
    const colors: string[] = []
    const labels: string[] = []

    const transactionsToUse = filteredTransactions.filter((transaction) => {
        if (chartFilter.value === 'all') return true
        return transaction.type === chartFilter.value
    })

    if (chartFilter.value === 'all') {
        const incomeData: { [key: string]: number } = {}
        const expenseData: { [key: string]: number } = {}

        transactionsToUse.forEach((transaction) => {
            if (transaction.type === 'income') {
                incomeData[transaction.category] =
                    (incomeData[transaction.category] || 0) + transaction.amount
            } else {
                expenseData[transaction.category] =
                    (expenseData[transaction.category] || 0) + transaction.amount
            }
        })

        Object.keys(incomeData).forEach((category) => {
            labels.push(category)
            data[category] = incomeData[category]
            colors.push(financeStore.getCategoryColor('income', category))
        })

        Object.keys(expenseData).forEach((category) => {
            labels.push(category)
            data[category] = expenseData[category]
            colors.push(financeStore.getCategoryColor('expense', category))
        })
    } else {
        transactionsToUse.forEach((transaction) => {
            data[transaction.category] = (data[transaction.category] || 0) + transaction.amount
        })

        Object.keys(data).forEach((category) => {
            labels.push(category)
            colors.push(
                financeStore.getCategoryColor(chartFilter.value as 'income' | 'expense', category)
            )
        })
    }

    const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a)
    const sortedLabels = sortedEntries.map(([label]) => label)
    const sortedData = sortedEntries.map(([, value]) => value)
    const sortedColors = sortedLabels.map((label) => {
        const index = labels.indexOf(label)
        return colors[index]
    })

    return {
        labels: sortedLabels,
        data: sortedData,
        backgroundColor: sortedColors,
    }
}

// Вычисляемые свойства (только для отображения)
const chartData = computed(() => getChartData())
const hasData = computed(() => {
    return chartData.value.data.length > 0 && chartData.value.data.some((amount) => amount > 0)
})

const centerAmount = computed(() => {
    const filteredTransactions = getFilteredTransactions()
    const transactions = filteredTransactions.filter((transaction) => {
        if (chartFilter.value === 'all') return true
        return transaction.type === chartFilter.value
    })

    if (chartFilter.value === 'all') {
        const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
        const expenses = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        return income - expenses
    } else if (chartFilter.value === 'income') {
        return transactions.reduce((sum, t) => sum + t.amount, 0)
    } else {
        return transactions.reduce((sum, t) => sum + t.amount, 0)
    }
})

const centerLabel = computed(() => {
    switch (chartFilter.value) {
        case 'income':
            return 'Доходы'
        case 'expense':
            return 'Расходы'
        default:
            return 'Баланс'
    }
})

const filterInfo = computed(() => {
    if (periodFilter.value === 'custom' && selectedDate.value) {
        const date = new Date(selectedDate.value)
        return `Показаны операции за ${date.toLocaleDateString('ru-RU')}`
    }
    if (periodFilter.value === 'today') {
        return 'Показаны операции за сегодня'
    }
    if (periodFilter.value === 'week') {
        return 'Показаны операции за последние 7 дней'
    }
    if (periodFilter.value === 'month') {
        return 'Показаны операции за текущий месяц'
    }
    return 'Показаны все операции'
})

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
    }).format(amount)
}

// Создание графика (вызывается только один раз)
const createChart = async () => {
    await nextTick()

    if (!chartCanvas.value || !isMounted.value) {
        return
    }

    // Уничтожаем старый график если существует
    if (chartInstance.value) {
        chartInstance.value.destroy()
    }

    try {
        chartInstance.value = new Chart(chartCanvas.value, {
            type: 'doughnut',
            data: {
                labels: chartData.value.labels,
                datasets: [
                    {
                        data: chartData.value.data,
                        backgroundColor: chartData.value.backgroundColor,
                        borderWidth: 3,
                        borderColor: '#ffffff',
                        hoverBorderWidth: 4,
                        hoverBorderColor: '#ffffff',
                        hoverOffset: 8,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || ''
                                const value = context.raw as number
                                const total = context.dataset.data.reduce(
                                    (a: number, b: number) => a + b,
                                    0
                                )
                                const percentage = Math.round((value / total) * 100)
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`
                            },
                        },
                    },
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 800,
                    easing: 'easeOutQuart',
                },
            },
        })
    } catch (error) {
        console.error('Ошибка создания графика:', error)
    }
}

// Обновление данных графика (без пересоздания)
const updateChartData = () => {
    if (!chartInstance.value || !hasData.value) {
        return
    }

    try {
        const dataset = chartInstance.value.data?.datasets?.[0]
        if (dataset) {
            chartInstance.value.data.labels = chartData.value.labels
            dataset.data = chartData.value.data
            dataset.backgroundColor = chartData.value.backgroundColor
            chartInstance.value.update('active')
        }
    } catch (error) {
        console.error('Ошибка обновления графика:', error)
    }
}

// Обработчик изменения фильтров
const handleFilterChange = () => {
    if (chartInstance.value) {
        updateChartData()
    }
}

// Инициализация при монтировании
onMounted(() => {
    isMounted.value = true
    // Ждем немного чтобы убедиться что DOM готов
    setTimeout(() => {
        createChart()
    }, 100)
})

// Уничтожение при размонтировании
onUnmounted(() => {
    isMounted.value = false
    if (chartInstance.value) {
        chartInstance.value.destroy()
        chartInstance.value = null
    }
})
</script>

<style scoped>
.chart-wrapper {
    position: relative;
    height: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-center-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
}

.center-amount {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1976d2;
    margin-bottom: 4px;
}

.center-label {
    font-size: 0.875rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.legend-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
}
</style>
