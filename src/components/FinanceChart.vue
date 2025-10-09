<template>
    <v-card variant="outlined">
        <v-card-title class="d-flex justify-space-between align-center">
            <div>
                <v-icon class="mr-2">mdi-chart-donut</v-icon>
                Финансовая статистика
            </div>
            <div class="d-flex align-center" style="gap: 8px">
                <!-- Фильтр по типу -->
                <v-select
                    v-model="chartFilter"
                    :items="chartFilters"
                    density="compact"
                    variant="outlined"
                    style="min-width: 140px"
                    hide-details
                />
                <!-- Фильтр по периоду -->
                <v-select
                    v-model="periodFilter"
                    :items="periodFilters"
                    density="compact"
                    variant="outlined"
                    style="min-width: 140px"
                    hide-details
                />
                <!-- Выбор конкретной даты -->
                <v-text-field
                    v-model="selectedDate"
                    label="Выбрать дату"
                    type="date"
                    density="compact"
                    variant="outlined"
                    style="min-width: 150px"
                    hide-details
                    :max="new Date().toISOString().split('T')[0]"
                />
            </div>
        </v-card-title>

        <v-card-text>
            <!-- Информация о фильтрах -->
            <v-alert v-if="filterInfo" type="info" density="compact" class="mb-4">
                {{ filterInfo }}
            </v-alert>

            <div v-if="hasData" class="chart-container">
                <canvas ref="chartCanvas"></canvas>
                <div class="chart-center-text">
                    <div class="center-amount">{{ formatCurrency(centerAmount) }}</div>
                    <div class="center-label">{{ centerLabel }}</div>
                </div>
            </div>

            <div v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-chart-donut</v-icon>
                <p class="text-h6 text-grey">Нет данных для отображения</p>
                <p class="text-grey">Добавьте транзакции или измените параметры фильтрации</p>
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const financeStore = useFinanceStore()
const chartCanvas = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)

// Фильтры
const chartFilter = ref('all') // all, income, expense
const periodFilter = ref('all') // all, today, week, month, custom
const selectedDate = ref('') // для выбора конкретной даты

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

// Информация о текущем фильтре
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

// Фильтрация транзакций по периоду
const filteredTransactions = computed(() => {
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
})

// Сумма для центра круга
const centerAmount = computed(() => {
    const transactions = filteredTransactions.value.filter((transaction) => {
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

// Подготовка данных для графика
const chartData = computed(() => {
    let data: { [key: string]: number } = {}
    const colors: string[] = []
    const labels: string[] = []

    // Фильтруем по типу
    const transactionsToUse = filteredTransactions.value.filter((transaction) => {
        if (chartFilter.value === 'all') return true
        return transaction.type === chartFilter.value
    })

    if (chartFilter.value === 'all') {
        // Объединяем доходы и расходы
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

        // Добавляем доходы
        Object.keys(incomeData).forEach((category) => {
            const label = `${category}`
            labels.push(label)
            data[label] = incomeData[category]
            colors.push(financeStore.getCategoryColor('income', category))
        })

        // Добавляем расходы
        Object.keys(expenseData).forEach((category) => {
            const label = `${category}`
            labels.push(label)
            data[label] = expenseData[category]
            colors.push(financeStore.getCategoryColor('expense', category))
        })
    } else {
        // Только доходы или только расходы
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

    // Сортируем по убыванию суммы
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
})

const hasData = computed(() => {
    return chartData.value.data.length > 0 && chartData.value.data.some((amount) => amount > 0)
})

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
    }).format(amount)
}

const createChart = () => {
    if (!chartCanvas.value || !hasData.value) return

    // Удаляем старый график если существует
    if (chartInstance.value) {
        chartInstance.value.destroy()
    }

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
                        label: function (context) {
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
            },
        },
    })
}

// Создаем график при монтировании и при изменении данных
onMounted(() => {
    if (hasData.value) {
        createChart()
    }
})

watch(
    [chartData, chartFilter, periodFilter, selectedDate],
    () => {
        if (hasData.value) {
            setTimeout(createChart, 100)
        }
    },
    { deep: true }
)

// Сбрасываем выбранную дату при смене периода
watch(periodFilter, (newPeriod) => {
    if (newPeriod !== 'custom') {
        selectedDate.value = ''
    }
})

onUnmounted(() => {
    if (chartInstance.value) {
        chartInstance.value.destroy()
    }
})
</script>

<style scoped>
.chart-container {
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
