import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { db } from '../firebaseConfig'
import { ref, onValue } from 'firebase/database'

function Results() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query')?.toLowerCase() || ''
  const [results, setResults] = useState([])

  useEffect(() => {
    const shopkeepersRef = ref(db, 'shopkeepers')
    const unsubscribe = onValue(shopkeepersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convert object to array with keys
        const shopkeepersArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }))
        // Filter based on query matching area or pincode
        const filtered = shopkeepersArray.filter(shop => 
          shop.area?.toLowerCase().includes(query) || 
          shop.pincode?.toLowerCase().includes(query)
        )
        setResults(filtered)
      } else {
        setResults([])
      }
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [query])

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Top Shopkeepers</h2>
      <div className="row">
        {results.map((shop) => (
          <div className="col-md-4 mb-4" key={shop.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{shop.shopkeeper_name}</h5>
                <p className="card-text">
                  <strong>Area:</strong> {shop.area}<br />
                  <strong>Mobile:</strong> {shop.mobile_number}<br />
                  <strong>Revenue:</strong> ₹{shop.revenue}<br />
                  <strong>Target:</strong> ₹{shop.target}<br />
                  <strong>Achieved Target:</strong> ₹{shop.achieved_target}
                </p>
                <a href={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary w-100">View on Map</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <Link to="/" className="btn btn-secondary">Search Again</Link>
      </div>
    </div>
  )
}

export default Results
