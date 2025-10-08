<template>
    <v-card class="auth-card mx-auto" max-width="650">
        <v-card-title class="text-center">
            <h2>{{ isLogin ? 'Вход' : 'Регистрация' }}</h2>
        </v-card-title>

        <v-card-text class="mt-4">
            <v-form @submit.prevent="submit" validate-on="submit">
                <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    :error-messages="showEmailErrors ? emailErrors : []"
                    @blur="emailTouched = true"
                    @input="handleInput"
                ></v-text-field>

                <v-text-field
                    v-model="password"
                    label="Пароль"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    :error-messages="showPasswordErrors ? passwordErrors : []"
                    @blur="passwordTouched = true"
                    @input="handleInput"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                ></v-text-field>

                <v-alert v-if="authStore.error" type="error" density="compact" class="mb-4">
                    {{ authStore.error }}
                </v-alert>

                <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    :loading="authStore.loading"
                    class="mt-4"
                >
                    {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
                </v-btn>

                <v-divider class="my-4"></v-divider>

                <div
                    class="text-center text-body-1 cursor-pointer"
                    @click="toggleAuthMode"
                >
                    {{ isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
                </div>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { LoginCredentials, RegisterCredentials } from '../types/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref<string>('')
const password = ref<string>('')
const isLogin = ref<boolean>(true)
const showPassword = ref<boolean>(false)
const emailTouched = ref<boolean>(false)
const passwordTouched = ref<boolean>(false)
const formSubmitted = ref<boolean>(false)

// Валидация email
const emailErrors = computed((): string[] => {
    const errors: string[] = []

    if (!email.value.trim()) {
        errors.push('Email обязателен')
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
        errors.push('Некорректный email')
    }

    return errors
})

// Валидация пароля
const passwordErrors = computed((): string[] => {
    const errors: string[] = []

    if (!password.value) {
        errors.push('Пароль обязателен')
    } else if (password.value.length < 6) {
        errors.push('Пароль должен быть не менее 6 символов')
    }

    return errors
})

// Показывать ошибки email только при определенных условиях
const showEmailErrors = computed((): boolean => {
    return (
        (emailTouched.value && emailErrors.value.length > 0) ||
        (formSubmitted.value && emailErrors.value.length > 0)
    )
})

// Показывать ошибки пароля только при определенных условиях
const showPasswordErrors = computed((): boolean => {
    return (
        (passwordTouched.value && passwordErrors.value.length > 0) ||
        (formSubmitted.value && passwordErrors.value.length > 0)
    )
})

// Проверка валидности всей формы
const isFormValid = computed((): boolean => {
    return emailErrors.value.length === 0 && passwordErrors.value.length === 0
})

const handleInput = (): void => {
    // Очищаем ошибки Firebase при вводе
    authStore.error = null
}

const toggleAuthMode = (): void => {
    isLogin.value = !isLogin.value
    // Сбрасываем состояние полей
    emailTouched.value = false
    passwordTouched.value = false
    formSubmitted.value = false
    authStore.error = null
}

const submit = async (): Promise<void> => {
    // Помечаем форму как отправленную
    formSubmitted.value = true
    emailTouched.value = true
    passwordTouched.value = true

    // Если есть ошибки валидации - не отправляем форму
    if (!isFormValid.value) {
        return
    }

    try {
        const credentials: LoginCredentials | RegisterCredentials = {
            email: email.value.trim(),
            password: password.value,
        }

        if (isLogin.value) {
            await authStore.login(credentials)
        } else {
            await authStore.register(credentials)
        }

        if (authStore.user) {
            router.push('/home')
        }

        // Очистка формы после успешной аутентификации
        resetForm()
    } catch (error) {
        // Ошибка уже обрабатывается в store
        console.error('Auth error:', error)
    }
}

const resetForm = (): void => {
    email.value = ''
    password.value = ''
    emailTouched.value = false
    passwordTouched.value = false
    formSubmitted.value = false
    showPassword.value = false
}
</script>

<style scoped>
.auth-card {
    margin-top: 50px;
    padding: 20px;
}

.cursor-pointer {
    cursor: pointer;
    transition: color 0.15s linear;
}

.cursor-pointer:hover {
    color: #1976d2;
    text-decoration: underline;
}

:deep(.v-messages__message) {
    color: rgb(176, 0, 32);
    font-size: 0.75rem;
    line-height: 1.25rem;
}
</style>
