import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type UserCredential,
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import type { User, LoginCredentials, RegisterCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
    const user: Ref<User | null> = ref(null)
    const loading: Ref<boolean> = ref(false)
    const error: Ref<string | null> = ref(null)

    //Регистрация
    const register = async (credentials: RegisterCredentials) => {
        loading.value = true
        error.value = null

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            )

            user.value = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                emailVerified: userCredential.user.emailVerified,
            }

            return userCredential
        } catch (err) {
            error.value = (err as Error).message
        } finally {
            loading.value = false
        }
    }

    //Вход
    const login = async (credentials: LoginCredentials) => {
        loading.value = true
        error.value = null

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            )

            user.value = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                emailVerified: userCredential.user.emailVerified,
            }

            return userCredential
        } catch (err) {
            error.value = (err as Error).message
        } finally {
            loading.value = false
        }
    }

    //Выход
    const logout = async (): Promise<void> => {
        try {
            await signOut(auth)
            user.value = null
        } catch (err) {
            error.value = (err as Error).message
        }
    }

    //Слушатель изменения состояния аунтентификации
    const initAuth = (): void => {
        onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                user.value = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                }
            } else {
                user.value = null
            }
        })
    }

    return { user, loading, error, register, login, logout, initAuth }
})
