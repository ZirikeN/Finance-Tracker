<template>
    <div v-if="props.loading" class="fullscreen-loader">
        <!-- Затемнение фона -->
        <div class="loader-backdrop"></div>

        <div class="loader-content">
            <div class="loader-spinner">
                <div class="spinner-circle spinner-circle-1"></div>
                <div class="spinner-circle spinner-circle-2"></div>
                <div class="spinner-circle spinner-circle-3"></div>
            </div>

            <div class="loader-text">
                <h3 class="loader-title">{{ props.title }}</h3>
                <p class="loader-message">{{ props.message }}</p>
                <p v-if="props.subMessage" class="loader-submessage">{{ props.subMessage }}</p>
            </div>

            <!-- Прогресс-бар (опционально) -->
            <v-progress-linear
                v-if="props.showProgress"
                color="primary"
                indeterminate
                height="4"
                class="mt-4"
            ></v-progress-linear>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    loading: boolean
    title?: string
    message?: string
    subMessage?: string
    showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Загрузка',
    message: 'Пожалуйста, подождите...',
    subMessage: '',
    showProgress: false,
})
</script>

<style scoped>
.fullscreen-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loader-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.loader-content {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    min-width: 280px;
    max-width: 400px;
}

.loader-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
}

.spinner-circle {
    position: absolute;
    border: 3px solid transparent;
    border-top: 3px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.spinner-circle-1 {
    width: 80px;
    height: 80px;
    animation-duration: 1s;
}

.spinner-circle-2 {
    top: 10px;
    left: 10px;
    width: 60px;
    height: 60px;
    border-top-color: #42a5f5;
    animation-duration: 1.2s;
    animation-direction: reverse;
}

.spinner-circle-3 {
    top: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    border-top-color: #90caf9;
    animation-duration: 0.8s;
}

.loader-text {
    margin-bottom: 1rem;
}

.loader-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1976d2;
}

.loader-message {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
}

.loader-submessage {
    font-size: 0.75rem;
    color: #999;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
