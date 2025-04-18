import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

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
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      alert('Registration successful. You can now login.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogleRegister = async () => {
    setError('')
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      // Optionally, you can handle user info or token here
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-danger mb-3">{error}</div>}
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <hr />
      <button onClick={handleGoogleRegister} className="btn btn-danger mt-3">
        Register with Google
      </button>
    </div>
  )
}

export default Register
