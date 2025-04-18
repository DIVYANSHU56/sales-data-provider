import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

function Results() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') || ''
  const [results, setResults] = useState([])
  const [mapHtml, setMapHtml] = useState('')

  useEffect(() => {
    if (query) {
      fetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results)
          setMapHtml(data.map_html)
        })
        .catch((err) => {
          console.error('Failed to fetch search results:', err)
        })
    }
  }, [query])

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Top Shopkeepers</h2>
      <div className="row">
        {results.map((shop, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{shop.Shopkeeper_Name}</h5>
                <p className="card-text">
                  <strong>Area:</strong> {shop.Area}<br />
                  <strong>Mobile:</strong> {shop.Mobile_Number}<br />
                  <strong>Revenue:</strong> ₹{shop.Revenue}<br />
                  <strong>Target:</strong> ₹{shop.Target}<br />
                  <strong>Prediction:</strong> {shop.Prediction_Label}
                </p>
                <a href={`https://www.google.com/maps?q=${shop.Latitude},${shop.Longitude}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary w-100">View on Map</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="map-container mt-5" dangerouslySetInnerHTML={{ __html: mapHtml }} />

      <div className="text-center mt-4">
        <Link to="/" className="btn btn-secondary">Search Again</Link>
      </div>
    </div>
  )
}

export default Results
