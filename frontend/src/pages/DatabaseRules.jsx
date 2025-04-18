import React from 'react'

function DatabaseRules() {
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Firebase Realtime Database Rules</h2>
      <p>
        To allow your app to write data to the Firebase Realtime Database, you need to configure the database rules properly.
      </p>
      <h4>Example Rules for Authenticated Users</h4>
      <pre style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '5px' }}>
{`{
  "rules": {
    "salesProviders": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}`}
      </pre>
      <p>
        These rules allow only authenticated users to read and write data under the <code>salesProviders</code> path.
      </p>
      <h4>Example Rules for Public Access (Not Recommended for Production)</h4>
      <pre style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '5px' }}>
{`{
  "rules": {
    "salesProviders": {
      ".read": true,
      ".write": true
    }
  }
}`}
      </pre>
      <p>
        These rules allow anyone to read and write data under the <code>salesProviders</code> path.
      </p>
      <p>
        You can update these rules in the Firebase Console under Realtime Database Rules.
      </p>
      <p>
        For better security, consider implementing Firebase Authentication and restricting access accordingly.
      </p>
    </div>
  )
}

export default DatabaseRules
