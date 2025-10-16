<template>
    <div v-if="props.loading" class="fullscreen-loader">
        <!-- Затемнение фона с glass-morphism эффектом -->
        <div class="loader-backdrop"></div>

        <div class="loader-content">
            <!-- Анимированный спиннер -->
            <div class="loader-spinner">
                <div class="spinner-circle spinner-circle-1"></div>
                <div class="spinner-circle spinner-circle-2"></div>
                <div class="spinner-circle spinner-circle-3"></div>
            </div>

            <!-- Текстовый контент -->
            <div class="loader-text">
                <h3 class="loader-title">{{ props.title }}</h3>
                <p class="loader-message">{{ props.message }}</p>
                <p v-if="props.subMessage" class="loader-submessage">{{ props.subMessage }}</p>
            </div>

            <!-- Прогресс-бар с градиентом -->
            <div v-if="props.showProgress" class="progress-container">
                <v-progress-linear
                    color="primary"
                    indeterminate
                    height="6"
                    rounded
                ></v-progress-linear>
            </div>

            <!-- Дополнительные декоративные элементы -->
            <div class="loader-decoration">
                <div class="decoration-dot decoration-dot-1"></div>
                <div class="decoration-dot decoration-dot-2"></div>
                <div class="decoration-dot decoration-dot-3"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Импорт стилей
import '@/assets/scss/loader.scss'

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
/* Дополнительные стили для декоративных элементов */
.loader-decoration {
    position: absolute;
    top: -10px;
    right: -10px;
    bottom: -10px;
    left: -10px;
    pointer-events: none;
    z-index: -1;
}

.decoration-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--v-primary);
    opacity: 0.6;
    animation: float 3s ease-in-out infinite;
}

.decoration-dot-1 {
    top: 20%;
    left: 10%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    animation-delay: 0s;
}

.decoration-dot-2 {
    top: 60%;
    right: 15%;
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    animation-delay: 1s;
}

.decoration-dot-3 {
    bottom: 30%;
    left: 20%;
    background: linear-gradient(135deg, #fa709a, #fee140);
    animation-delay: 2s;
}

@keyframes float {
    0%,
    100% {
        transform: translateY(0) scale(1);
        opacity: 0.6;
    }
    50% {
        transform: translateY(-20px) scale(1.1);
        opacity: 0.8;
    }
}

/* Плавное появление и исчезновение */
.fullscreen-loader {
    transition: opacity 0.3s ease-out;
}

/* Улучшенная анимация спиннера */
@keyframes spin {
    0% {
        transform: rotate(0deg);
        border-top-color: #667eea;
    }
    25% {
        border-top-color: #764ba2;
    }
    50% {
        border-top-color: #4facfe;
    }
    75% {
        border-top-color: #00f2fe;
    }
    100% {
        transform: rotate(360deg);
        border-top-color: #667eea;
    }
}
</style>
