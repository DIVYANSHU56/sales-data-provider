import React, { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { db } from '../firebaseConfig'
import { ref, push } from 'firebase/database'

const auth = getAuth()
const provider = new GoogleAuthProvider()

function AddSalesProvider() {
  const [formData, setFormData] = useState({
    shopkeeper_name: '',
    area: '',
    pincode: '',
    mobile_number: '',
    revenue: '',
    target: '',
    latitude: '',
    longitude: ''
  })

  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError('Login failed. Please try again.')
    }
  }

  const validateForm = () => {
    if (
      formData.shopkeeper_name.length === 0 || formData.shopkeeper_name.length > 100 ||
      formData.area.length === 0 || formData.area.length > 100 ||
      formData.pincode.length !== 6 ||
      formData.mobile_number.length !== 10 ||
      isNaN(parseFloat(formData.revenue)) || parseFloat(formData.revenue) < 0 ||
      isNaN(parseFloat(formData.target)) || parseFloat(formData.target) < 0 ||
      isNaN(parseFloat(formData.latitude)) || parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90 ||
      isNaN(parseFloat(formData.longitude)) || parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180
    ) {
      return false
    }
    return true
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!user) {
      setError('You must be logged in to submit data.')
      return
    }

    if (!validateForm()) {
      setError('Please fill all fields correctly according to validation rules.')
      return
    }

    setLoading(true)

    try {
      const shopkeepersRef = ref(db, 'shopkeepers')
      await push(shopkeepersRef, {
        shopkeeper_name: formData.shopkeeper_name,
        area: formData.area,
        pincode: formData.pincode,
        mobile_number: formData.mobile_number,
        revenue: parseFloat(formData.revenue),
        target: parseFloat(formData.target),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        achieved_target: 0
      })

      setMessage('Data added successfully.')
      setFormData({
        shopkeeper_name: '',
        area: '',
        pincode: '',
        mobile_number: '',
        revenue: '',
        target: '',
        latitude: '',
        longitude: ''
      })
    } catch (err) {
      setError('Error submitting data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-4">
      <h2>Add Sales Provider Data</h2>
      {!user && (
        <div className="mb-3">
          <button className="btn btn-primary" onClick={handleLogin}>Login with Google to Submit Data</button>
        </div>
      )}
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="shopkeeper_name" className="form-label">Shopkeeper Name</label>
          <input type="text" className="form-control" id="shopkeeper_name" name="shopkeeper_name" value={formData.shopkeeper_name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="area" className="form-label">Area</label>
          <input type="text" className="form-control" id="area" name="area" value={formData.area} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="pincode" className="form-label">Pincode</label>
          <input type="text" className="form-control" id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="mobile_number" className="form-label">Mobile Number</label>
          <input type="text" className="form-control" id="mobile_number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="revenue" className="form-label">Revenue</label>
          <input type="number" step="0.01" className="form-control" id="revenue" name="revenue" value={formData.revenue} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="target" className="form-label">Target</label>
          <input type="number" step="0.01" className="form-control" id="target" name="target" value={formData.target} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="latitude" className="form-label">Latitude</label>
          <input type="number" step="0.000001" className="form-control" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="longitude" className="form-label">Longitude</label>
          <input type="number" step="0.000001" className="form-control" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Data'}
        </button>
      </form>
    </div>
  )
}

export default AddSalesProvider
