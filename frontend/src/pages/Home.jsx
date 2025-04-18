import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate('/results?query=' + encodeURIComponent(query))
    }
  }

  return (
    <div className="text-center mt-5">
      <h1 className="display-4 mb-4">Smart Recommendation System</h1>
      <p className="lead">Search for shopkeepers by area name or pincode to get top recommendations based on revenue and ML insights.</p>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter Area or Pincode"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary btn-lg w-100">Search</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Home
