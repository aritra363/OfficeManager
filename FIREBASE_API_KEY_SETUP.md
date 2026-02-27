# 🔑 Firebase API Key Setup Guide

## Where to Put Your Firebase Credentials

Your Firebase API key and other credentials go in the **`.env.local`** file in your project root.

## File Location

```
f:\xampp\htdocs\officemanager\
├── .env.local ← PUT YOUR CREDENTIALS HERE
├── .env.local.example ← Reference template
└── firebaseConfig.ts ← Reads from .env.local automatically
```

## Step-by-Step: Get Your Firebase Credentials

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com
- Log in with your Google account
- Select your "office-manager" project

### 2. Find Project Settings
- Click the **⚙️ gear icon** (Project Settings) in the top-left
- It's next to the project name

### 3. Go to "Your apps"
- Scroll down to the "Your apps" section
- Find your web app (should look like: `</> office-manager`)
- Click on it

### 4. Copy the Configuration
You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "office-manager-12345.firebaseapp.com",
  projectId: "office-manager-12345",
  storageBucket: "office-manager-12345.appspot.com",
  messagingSenderId: "123456789123",
  appId: "1:123456789123:web:abcdef123456"
};
```

## Step-by-Step: Fill in .env.local

### 1. Open `.env.local` file
Located at: `f:\xampp\htdocs\officemanager\.env.local`

### 2. Replace the placeholder values with your actual Firebase credentials

**BEFORE** (what you see):
```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

**AFTER** (example with real values):
```env
VITE_FIREBASE_API_KEY=AIzaSyDxample123456789_abcdef
VITE_FIREBASE_AUTH_DOMAIN=office-manager-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=office-manager-12345
VITE_FIREBASE_STORAGE_BUCKET=office-manager-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789123
VITE_FIREBASE_APP_ID=1:123456789123:web:abcdef123456
```

### 3. Save the file
- Make sure to save `.env.local` after filling in values
- **IMPORTANT:** Do NOT commit this file to git!

## Variable Mapping

| In `.env.local` | Maps to | From Firebase Config |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` | `"AIzaSy..."` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | `"your-project.firebaseapp.com"` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | `"your-project-id"` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | `"your-project.appspot.com"` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | `"123456789"` |
| `VITE_FIREBASE_APP_ID` | `appId` | `"1:123456789:web:..."` |

## How It Works

```
.env.local
   ↓
import.meta.env.VITE_FIREBASE_API_KEY (reads the value)
   ↓
firebaseConfig.ts (receives the value)
   ↓
firebaseService.ts (uses the config)
   ↓
App.tsx (initializes Firebase)
```

## Important Rules

✅ **DO:**
- Use the exact variable names (starting with `VITE_`)
- Copy values exactly from Firebase Console (no extra spaces)
- Keep one value per line
- Use format: `KEY=VALUE` with no spaces around `=`
- Save the file after editing

❌ **DON'T:**
- Add quotes around values
- Include extra spaces
- Commit `.env.local` to git
- Share your credentials with anyone
- Put this file in version control

## Verify It Works

1. Open your terminal in the project folder
2. Run: `npm run dev`
3. Check for errors in the console
4. If you see "Failed to connect to database", check:
   - All values in `.env.local` are filled
   - No typos in variable names
   - Firebase project is active

## Example File

See `f:\xampp\htdocs\officemanager\.env.local` - it's already created with instructions!

## If You Get Errors

### "Cannot find module 'firebase'"
```bash
npm install firebase
```

### "Failed to connect to database"
1. Check `.env.local` exists
2. Verify all VITE_FIREBASE_ variables are filled
3. Check no extra spaces in values
4. Verify Firebase project is active

### "Permission denied" in console
- Firestore may be in Test mode (correct for development)
- See FIREBASE_SETUP.md for production rules

## Need More Help?

- Firebase Credentials Docs: https://firebase.google.com/docs/database/start
- Vite Env Variables: https://vitejs.dev/guide/env-and-mode.html
- See: `FIREBASE_SETUP.md` in your project folder

---

**Summary:**
1. Get credentials from https://console.firebase.google.com
2. Fill in `.env.local` file
3. Save and restart `npm run dev`
4. Done! ✅
