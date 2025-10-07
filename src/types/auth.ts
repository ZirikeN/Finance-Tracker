export interface User {
    uid: string
    email: string | null
    emailVerified: boolean
}

export interface AuthState {
    user: User | null
    loading: boolean
    error: string | null
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials extends LoginCredentials {
    // Можно добавить дополнительные поля для регистрации
}
