# Quick Start Guide

Get your Office Manager app running with Firebase in 5 minutes!

## What You Need

- Node.js 16+ ([Download](https://nodejs.org/))
- Google account (for Firebase)
- Code editor (VS Code recommended)

## Step 1: Create Firebase Project (2 min)

1. Go to https://console.firebase.google.com
2. Click **"Create Project"**
3. Enter name: `office-manager`
4. Skip Google Analytics
5. Wait for creation

## Step 2: Enable Firestore Database (1 min)

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Choose location closest to you
4. Start in **Test mode**
5. Click **Enable**

## Step 3: Copy Your Credentials (1 min)

1. Click gear icon → **Project Settings**
2. Scroll to "Your apps" → click web icon `</>`
3. Copy the config object that shows

Example of what you'll see:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "office-manager-123.firebaseapp.com",
  projectId: "office-manager-123",
  storageBucket: "office-manager-123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Step 4: Configure Your App (1 min)

1. Navigate to your project folder
2. Create `.env.local` file:

   **Windows (PowerShell):**
   ```powershell
   copy .env.local.example .env.local
   ```
   
   **Mac/Linux:**
   ```bash
   cp .env.local.example .env.local
   ```

3. Edit `.env.local` and fill in your credentials:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSyD...
   VITE_FIREBASE_AUTH_DOMAIN=office-manager-123.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=office-manager-123
   VITE_FIREBASE_STORAGE_BUCKET=office-manager-123.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
   ```

## Step 5: Install & Run (Remaining)

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

Open http://localhost:3000 in your browser! 🎉

## First Time Setup

When you open the app:
1. It will automatically create an admin user
2. You can log in with any credentials (for now)
3. Create your first employee
4. Create work types
5. Start tracking!

## Check It's Working

1. Open Firebase Console → Firestore Database
2. Click the **Data** tab
3. You should see your collections:
   - `users` - your accounts
   - `workTypes` - document categories
   - `workRecords` - your entries

## Test Real-Time Sync

1. Open app in 2 browser tabs
2. In one tab, create a new work type
3. The other tab should update instantly (no refresh!)
4. That's real-time sync working! ✓

## Next Steps

- Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed info
- See [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) for full testing
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) to understand how it works

## Troubleshooting

### "Cannot find module 'firebase'"
```bash
npm install firebase
```

### "Failed to connect to database"
- Check `.env.local` exists
- Verify all credentials are filled in correctly
- No extra spaces around `=` signs
- Firebase project is active (not deleted)

### "Empty database"
- Firestore takes 10-30 seconds to initialize
- Refresh the app
- Check Firebase Console that database exists

### "Permission denied" in console
- Switch Firestore to **Test mode** temporarily
- See FIREBASE_SETUP.md for production rules

## Quick Reference

| Task | Command |
|------|---------|
| Install | `npm install` |
| Start Dev | `npm run dev` |
| Build | `npm run build` |
| Preview Build | `npm run preview` |
| Check Types | `npm run lint` |

## Important Files

- `.env.local` - Your Firebase credentials (**don't commit!**)
- `firebaseService.ts` - Database operations
- `firebaseConfig.ts` - Firebase setup
- `storage.ts` - Simplified API

## Docs

- Full setup: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)  
- Changes made: [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)
- Complete checklist: [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)

---

**Need help?** Check the docs above or visit [Firebase Docs](https://firebase.google.com/docs)

**Ready to go live?** See FIREBASE_SETUP.md → Security Considerations
