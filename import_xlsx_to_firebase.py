import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
import math

# Path to your Firebase service account key JSON file
SERVICE_ACCOUNT_KEY = 'firebase-service-account.json'

# Firebase Realtime Database URL (replace with your database URL)
DATABASE_URL = 'https://sales-2025-d7c6f-default-rtdb.firebaseio.com/'

# Path to your Excel file
EXCEL_FILE = 'shopkeepers.xlsx'

def clean_value(value, default):
    if pd.isna(value) or (isinstance(value, float) and (math.isinf(value) or math.isnan(value))):
        return default
    return value

def main():
    # Initialize Firebase Admin SDK with Realtime Database
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred, {
        'databaseURL': DATABASE_URL
    })

    # Read Excel file
    df = pd.read_excel(EXCEL_FILE)

    # Reference to the "shopkeepers" node in Realtime Database
    ref_shopkeepers = db.reference('shopkeepers')

    # Iterate over DataFrame rows and push to Realtime Database
    for _, row in df.iterrows():
        data = {
            'shopkeeper_name': clean_value(row.get('Shopkeeper_Name', ''), ''),
            'area': clean_value(row.get('Area', ''), ''),
            'pincode': str(clean_value(row.get('Pincode', ''), '')),
            'mobile_number': str(clean_value(row.get('Mobile_Number', ''), '')),
            'revenue': float(clean_value(row.get('Revenue', 0), 0)),
            'target': float(clean_value(row.get('Target', 0), 0)),
            'latitude': float(clean_value(row.get('Latitude', 0), 0)),
            'longitude': float(clean_value(row.get('Longitude', 0), 0)),
            'achieved_target': float(clean_value(row.get('Achieved_Target', 0), 0))
        }
        ref_shopkeepers.push(data)

    print('Data imported successfully to Firebase Realtime Database.')

if __name__ == '__main__':
    main()
