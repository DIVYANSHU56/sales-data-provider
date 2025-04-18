import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyArHZBnGJSJNqyITiQWD2DsEfy8wBb-UqI",
  authDomain: "sales-2025-d7c6f.firebaseapp.com",
  projectId: "sales-2025-d7c6f",
  storageBucket: "sales-2025-d7c6f.firebasestorage.app",
  messagingSenderId: "855617694940",
  appId: "1:855617694940:web:fc6f360ffd1c511002d819",
  measurementId: "G-CGTS65YWQR"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { app, db }
