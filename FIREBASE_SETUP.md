# Firebase Migration Guide

This app has been refactored to use **Firebase Firestore** for backend and database instead of local storage.

## Key Changes

### 1. **Removed Local Storage**
- All data now persists in Firebase Firestore
- Real-time synchronization across all connected clients
- No more manual WebSocket broadcasting needed

### 2. **New Files**
- `firebaseConfig.ts` - Firebase configuration
- `firebaseService.ts` - Core Firebase operations and real-time listeners
- `.env.local.example` - Template for Firebase credentials

### 3. **Updated Files**
- `storage.ts` - Now wraps Firebase service with async methods
- `App.tsx` - Uses Firebase real-time listeners instead of WebSocket
- `server.ts` - Simplified (no WebSocket server needed)
- `package.json` - Added Firebase, removed WebSocket dependency

## Setup Instructions

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Enter project name (e.g., "Office Manager")
4. Click through to finish project setup

### Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Select a location (closest to your users)
4. Start in **Test mode** (for development)
   - ⚠️ In production, set proper security rules

### Step 3: Get Your Credentials

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Copy the Firebase config

### Step 4: Configure Environment Variables

1. Create `.env.local` in your project root (copy from `.env.local.example`)
2. Paste your Firebase credentials:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Run the App

```bash
npm run dev
```

The app will:
1. Initialize Firebase connection
2. Create initial admin user if database is empty
3. Set up real-time listeners for all data
4. Show loading state while connecting

## Database Structure

Firebase Firestore collections:

```
users/
  ├── {userId}
  │   ├── id
  │   ├── username
  │   ├── password (hashed in production)
  │   ├── name
  │   ├── role (admin/employee)
  │   └── createdAt

workTypes/
  ├── {typeId}
  │   ├── id
  │   ├── name
  │   ├── description
  │   ├── fields[]
  │   └── createdAt

workRecords/
  ├── {recordId}
  │   ├── id
  │   ├── workTypeId
  │   ├── employeeId
  │   ├── data{}
  │   ├── deactivatedFields[]
  │   ├── createdAt
  │   └── lastUpdated
```

## Real-Time Synchronization

All data changes are synced across clients via Firestore:

- **Users**: Changes reflected instantly
- **Work Types**: New categories appear immediately
- **Records**: Entries sync across all employees

## API Methods

The `Storage` object provides:

### Users
- `getUsers()` - Get all users
- `saveUsers(users)` - Save multiple users
- `saveUser(user)` - Save single user
- `deleteUser(userId)` - Remove a user

### Work Types
- `getWorkTypes()` - Get all work type definitions
- `saveWorkTypes(types)` - Save multiple types
- `saveWorkType(type)` - Save single type
- `deleteWorkType(typeId)` - Remove a type

### Work Records
- `getWorkRecords()` - Get all records
- `saveWorkRecords(records)` - Save multiple records
- `saveWorkRecord(record)` - Save single record
- `deleteWorkRecord(recordId)` - Remove a record
- `getRecordsByWorkType(typeId)` - Filter by type
- `getRecordsByEmployee(employeeId)` - Filter by employee

### Real-Time Listeners
- `subscribeToUsers(callback)` - Listen to user changes
- `subscribeToWorkTypes(callback)` - Listen to type changes
- `subscribeToWorkRecords(callback)` - Listen to record changes

## Security Considerations

### Development Mode (Current)
- Test mode allows all reads/writes
- Suitable for development only

### Production Mode
Update Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin can do everything
    match /{document=**} {
      allow read, write: if request.auth.uid == "ADMIN_UID";
    }
    
    // Employees can read all, write own records
    match /workRecords/{record} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.employeeId;
    }
    
    match /users/{user} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == user;
    }
    
    match /workTypes/{type} {
      allow read: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### "Failed to connect to database"
- Check Firebase credentials in `.env.local`
- Verify Firestore database is created and enabled
- Check browser console for Firebase errors

### "No data showing"
- Firestore may take a few seconds to initialize
- Check that collections exist in Firebase Console
- Verify security rules allow your user

### Real-time updates not working
- Check that listeners are properly initialized in App.tsx
- Verify Firebase credentials are correct
- Check browser DevTools Network tab for Firestore requests

## Production Deployment

1. **Set security rules** (see above)
2. **Enable Firebase Authentication** (optional, for better security)
3. **Add payment method** to Firebase if exceeding free tier
4. **Monitor costs** - Firestore pricing based on reads/writes/storage
5. **Enable automatic backups** in Firebase Console

## Environment Variables

Never commit `.env.local` to git. Use `.env.local.example` as a template:

```bash
# Don't include in version control
.env.local
```

## Performance Optimization

### Queries
The service supports filtered queries:
```javascript
const employeeRecords = await Storage.getRecordsByEmployee(employeeId);
const typeRecords = await Storage.getRecordsByWorkType(workTypeId);
```

### Pagination
For large datasets, implement pagination with Firestore `limit()` and `offset()` in `firebaseService.ts`.

### Indexing
Firestore automatically creates simple indexes. Complex queries may need composite indexes (Firebase will prompt you).

## Next Steps

1. Test the app with Firebase
2. Create more employees through the UI
3. Test real-time sync by opening in multiple windows
4. Set up proper security rules for production
5. Consider adding Firebase Authentication for better security

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)
