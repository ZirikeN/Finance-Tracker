import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: 'AIzaSyC6cAWe6Y1xwJ46BZs8XVh3TyBdbpApIiE',
    authDomain: 'finance-tracker-79381.firebaseapp.com',
    projectId: 'finance-tracker-79381',
    storageBucket: 'finance-tracker-79381.firebasestorage.app',
    messagingSenderId: '653194012031',
    appId: '1:653194012031:web:c8f602d8d5ba0ca7f5a64a',
}

const app = initializeApp(firebaseConfig)

const auth: Auth = getAuth(app)

export { auth }
