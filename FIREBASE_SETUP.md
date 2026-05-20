# Firebase Setup Guide for Kara Immobilier Service

Your Firebase project is already configured in the backend with project ID: **kara-immobilier-service**

## Step 1: Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **kara-immobilier-service**
3. Click **Settings** (⚙️ gear icon) → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file

## Step 2: Configure Environment Variables

1. Rename the downloaded JSON file to `serviceAccountKey.json`
2. Place it in the `backend/` directory (next to `server.py`)
3. Create a `.env` file in the `backend/` directory with:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=kara-immobilier-service
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
FIREBASE_DB_URL=https://kara-immobilier-service.firebaseio.com

# Other required configs
MONGO_URL=your_mongodb_url
DB_NAME=kara_immobilier
EMERGENT_LLM_KEY=your_emergent_key
SENDGRID_API_KEY=your_sendgrid_key
```

## Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 4: Verify Connection

The backend will automatically log Firebase initialization status. Look for:
```
✓ Firebase initialized successfully with project: kara-immobilier-service
```

## Using Firebase in Your Code

### Example 1: Store Contact Form in Firestore

```python
from firebase_helper import init_firebase_helper

firebase = init_firebase_helper()

# Add contact to Firestore
contact_data = {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Interested in property",
    "timestamp": datetime.now()
}
doc_id = await firebase.add_document("contacts", contact_data)
```

### Example 2: Store Property Listings

```python
# Add property to Firestore
property_data = {
    "title": "Beautiful Apartment",
    "location": "Paris 5ème",
    "price": 500000,
    "rooms": 3,
    "status": "available"
}
await firebase.add_document("properties", property_data)

# Query properties
properties = await firebase.get_all_documents("properties", {"status": "available"})
```

### Example 3: Upload Document

```python
# Upload files to Storage
url = await firebase.upload_file(
    local_path="/path/to/document.pdf",
    destination_path="documents/property_contract.pdf"
)
```

## Firebase Services Available

### Firestore (NoSQL Database)
- Store documents with automatic scaling
- Real-time updates
- Complex queries and indexing
- Use for: Properties, Contacts, Bookings, User Profiles

### Realtime Database
- Real-time data synchronization
- JSON-based structure
- Use for: Live chat, Active sessions, Notifications

### Storage
- File storage (images, PDFs, documents)
- Security rules for access control
- Use for: Property photos, Contracts, IDs

### Authentication
- User registration and login
- JWT token verification
- Use for: User accounts, API security

## Next Steps

1. ✅ Install firebase-admin SDK (done)
2. ⬜ Download your service account key
3. ⬜ Configure .env file
4. ⬜ Test Firebase connection
5. ⬜ Integrate Firebase into API endpoints

## Troubleshooting

**Error: "FIREBASE_CREDENTIALS_PATH not set"**
- Add `FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json` to .env

**Error: "Firebase initialization failed"**
- Verify serviceAccountKey.json exists and is valid
- Check FIREBASE_DB_URL matches your project
- Check internet connection and firewall

**Error: "Module not found: firebase_admin"**
- Run: `pip install -r requirements.txt` again

## Resources

- [Firebase Admin SDK (Python)](https://firebase.google.com/docs/database/admin/start)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
