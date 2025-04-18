import pandas as pd
from flask import Flask, render_template, request, redirect, url_for, session, flash
import folium
from sklearn.linear_model import LogisticRegression
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('firebase-service-account.json')  # You need to provide this file
firebase_admin.initialize_app(cred)
db = firestore.client()

EXCEL_FILE = 'shopkeepers.xlsx'
df = pd.read_excel(EXCEL_FILE)
df['Achieved_Target'] = df['Achieved_Target'].fillna(0)
X = df[['Revenue', 'Target']]
y = df['Achieved_Target']
model = LogisticRegression()
model.fit(X, y)

df = df.sort_values(by='Revenue', ascending=False)

from flask import redirect

@app.route('/')
def home():
    return redirect("http://localhost:3000")

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query'].strip().lower()
    results = df[(df['Area'].str.lower().str.contains(query)) | (df['Pincode'].astype(str).str.contains(query))]
    if not results.empty:
        results['Prediction'] = model.predict(results[['Revenue', 'Target']])
        results['Prediction_Label'] = results['Prediction'].apply(lambda x: '✅ Likely' if x == 1 else '❌ Unlikely')
    map_center = [results.iloc[0]['Latitude'], results.iloc[0]['Longitude']] if not results.empty else [26.9124, 75.7873]  # Jaipur coords default
    shop_map = folium.Map(location=map_center, zoom_start=13)

    for _, row in results.iterrows():
        folium.Marker(
            [row['Latitude'], row['Longitude']],
            popup=f"<b>{row['Shopkeeper_Name']}</b><br>Mobile: {row['Mobile_Number']}<br>Target: {row['Target']}<br>Revenue: ₹{row['Revenue']}<br>Prediction: {row['Prediction_Label']}"
        ).add_to(shop_map)

    map_html = shop_map._repr_html_()
    return render_template('results.html', results=results.to_dict(orient='records'), map_html=map_html)

from flask import jsonify

@app.route('/api/search', methods=['GET'])
def api_search():
    query = request.args.get('query', '').strip().lower()
    results = df[(df['Area'].str.lower().str.contains(query)) | (df['Pincode'].astype(str).str.contains(query))]
    if not results.empty:
        results['Prediction'] = model.predict(results[['Revenue', 'Target']])
        results['Prediction_Label'] = results['Prediction'].apply(lambda x: '✅ Likely' if x == 1 else '❌ Unlikely')
        map_center = [results.iloc[0]['Latitude'], results.iloc[0]['Longitude']]
    else:
        map_center = [26.9124, 75.7873]  # Jaipur coords default
    shop_map = folium.Map(location=map_center, zoom_start=13)

    for _, row in results.iterrows():
        folium.Marker(
            [row['Latitude'], row['Longitude']],
            popup=f"<b>{row['Shopkeeper_Name']}</b><br>Mobile: {row['Mobile_Number']}<br>Target: {row['Target']}<br>Revenue: ₹{row['Revenue']}<br>Prediction: {row['Prediction_Label']}"
        ).add_to(shop_map)

    map_html = shop_map._repr_html_()
    return jsonify({
        'results': results.to_dict(orient='records'),
        'map_html': map_html
    })

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        id_token = request.form.get('idToken')
        try:
            decoded_token = auth.verify_id_token(id_token)
            session['user'] = decoded_token
            return redirect(url_for('admin'))
        except Exception as e:
            flash('Invalid token. Please try again.', 'danger')
            return render_template('login.html')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('home'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Registration is handled client-side via Firebase SDK
        return redirect(url_for('login'))
    return render_template('register.html')

def is_admin():
    user = session.get('user')
    if user:
        # You can add more complex admin checks here, e.g., check user email or custom claims
        return True
    return False

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if not is_admin():
        return redirect(url_for('login'))
    if request.method == 'POST':
        shopkeeper_data = {
            'Shopkeeper_Name': request.form['shopkeeper_name'],
            'Area': request.form['area'],
            'Pincode': request.form['pincode'],
            'Mobile_Number': request.form['mobile_number'],
            'Revenue': float(request.form['revenue']),
            'Target': float(request.form['target']),
            'Latitude': float(request.form['latitude']),
            'Longitude': float(request.form['longitude']),
            'Achieved_Target': 0
        }
        db.collection('shopkeepers').add(shopkeeper_data)

        # Append to Excel file
        new_row = {
            'Shopkeeper_Name': request.form['shopkeeper_name'],
            'Area': request.form['area'],
            'Pincode': request.form['pincode'],
            'Mobile_Number': request.form['mobile_number'],
            'Revenue': float(request.form['revenue']),
            'Target': float(request.form['target']),
            'Latitude': float(request.form['latitude']),
            'Longitude': float(request.form['longitude']),
            'Achieved_Target': 0
        }
        global df
        df = df.append(new_row, ignore_index=True)
        df.to_excel(EXCEL_FILE, index=False)

        # Detect if request is AJAX/fetch
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
            return jsonify({'success': True, 'message': 'Data added successfully.'})
        else:
            return render_template('admin.html', success='Data added successfully.')
    return render_template('admin.html')

import pandas as pd
from firebase_admin import db as firebase_db
from flask import jsonify

@app.route('/import-xlsx', methods=['POST'])
def import_xlsx():
    if not is_admin():
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        EXCEL_FILE = 'shopkeepers.xlsx'
        df = pd.read_excel(EXCEL_FILE)

        ref_shopkeepers = firebase_db.reference('shopkeepers')

        # Clear existing data (optional)
        ref_shopkeepers.delete()

        for _, row in df.iterrows():
            data = {
                'shopkeeper_name': row.get('Shopkeeper_Name', '') or '',
                'area': row.get('Area', '') or '',
                'pincode': str(row.get('Pincode', '') or ''),
                'mobile_number': str(row.get('Mobile_Number', '') or ''),
                'revenue': float(row.get('Revenue', 0) or 0),
                'target': float(row.get('Target', 0) or 0),
                'latitude': float(row.get('Latitude', 0) or 0),
                'longitude': float(row.get('Longitude', 0) or 0),
                'achieved_target': float(row.get('Achieved_Target', 0) or 0)
            }
            ref_shopkeepers.push(data)

        return jsonify({'success': True, 'message': 'Data imported successfully from XLSX.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
