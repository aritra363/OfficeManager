# Firebase Migration Checklist

## Pre-Setup ✓

- [ ] Read `REFACTORING_SUMMARY.md` to understand changes
- [ ] Review `FIREBASE_SETUP.md` for detailed instructions
- [ ] Have Firebase Console access ready

## Firebase Project Setup

### 1. Create Firebase Project
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Create Project"
- [ ] Enter project name: "office-manager" (or your choice)
- [ ] Disable Google Analytics (optional)
- [ ] Wait for project creation

### 2. Enable Firestore Database
- [ ] In Firebase Console, navigate to **Build** → **Firestore Database**
- [ ] Click **Create Database**
- [ ] Select location (choose closest to your region)
- [ ] Start in **Test mode** (for development)
- [ ] Click **Enable**
- [ ] Wait for database initialization

### 3. Get Your Credentials
- [ ] Click gear icon → **Project Settings**
- [ ] Scroll to "Your apps" section
- [ ] Click web icon `</>`
- [ ] Copy the entire firebaseConfig object
- [ ] Save this somewhere secure

## Local Setup

### 4. Configure Environment
- [ ] Create `.env.local` file in project root
  ```bash
  cp .env.local.example .env.local
  ```
- [ ] Open `.env.local`
- [ ] Fill in each Firebase credential from step 3:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- [ ] Save `.env.local` (don't commit to git!)

### 5. Install Dependencies
- [ ] Run: `npm install`
- [ ] Wait for completion
- [ ] Should install Firebase SDK without errors

### 6. Start Development Server
- [ ] Run: `npm run dev`
- [ ] Should show: "Server running on http://0.0.0.0:3000"
- [ ] Should show: "Real-time sync powered by Firebase Firestore"
- [ ] Open http://localhost:3000 in browser

## Testing

### 7. Verify Firebase Connection
- [ ] App should load with brief loading state
- [ ] If error: Check `.env.local` credentials
- [ ] If error: Check browser DevTools → Console for errors
- [ ] If error: Check Firebase Console → Firestore → Data

### 8. Test Initial Admin Creation
- [ ] App should automatically create admin user on first run
- [ ] Go to Firebase Console → Firestore Database
- [ ] Check `users` collection exists
- [ ] Check `admin-0` document exists
- [ ] Can see user fields: username, password, name, role, createdAt

### 9. Test Login
- [ ] Try logging in with any username/password (for now)
- [ ] Should accept and show dashboard
- [ ] Admin users see admin dashboard
- [ ] Employees see employee dashboard

### 10. Test Create Operations
- [ ] Create new employee in "Employees" tab
- [ ] Go to Firebase Console → Firestore
- [ ] Check `users` collection - new user should appear
- [ ] Go back to app - should show instantly without refresh

### 11. Test Work Types
- [ ] Create new work type in "Work Types" tab
- [ ] Add some custom fields
- [ ] Check Firebase Console → `workTypes` collection
- [ ] Verify document created with your fields

### 12. Test Work Records
- [ ] Employee: Create new work record
- [ ] Fill in the fields
- [ ] Submit
- [ ] Check Firebase Console → `workRecords` collection
- [ ] Verify record created with correct data

### 13. Test Real-Time Sync
- [ ] Open app in 2 different browsers/tabs
- [ ] Both logged in as different users or same user
- [ ] Create/edit something in one window
- [ ] Check if it appears instantly in other window (no refresh)
- [ ] Test with all 3 data types: users, work types, records

### 14. Test Persistence
- [ ] Close browser/app completely
- [ ] Clear browser cache (optional)
- [ ] Reopen app at localhost:3000
- [ ] All data should still be there
- [ ] Firebase persisted it in the cloud

## Production Preparation

### 15. Security Rules
- [ ] Review FIREBASE_SETUP.md → Security Considerations
- [ ] Update Firestore rules for production
- [ ] Test rules with restricted access
- [ ] Don't use "Test mode" in production

### 16. Authentication (Optional but Recommended)
- [ ] Consider enabling Firebase Authentication
- [ ] See FIREBASE_SETUP.md for instructions
- [ ] Much more secure than simple username/password

### 17. Deployment
- [ ] Build: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Deploy to: Vercel, Firebase Hosting, or your server
- [ ] Update `.env.local` on server with production credentials

## Troubleshooting

If something fails, check this order:

1. **"Failed to connect to database"**
   - [ ] Check `.env.local` file exists
   - [ ] Check all FIREBASE_ variables are filled
   - [ ] Check copy/paste didn't add extra spaces
   - [ ] Check Firebase project is active (not deleted)
   - [ ] Try restarting `npm run dev`

2. **"No data showing in app"**
   - [ ] Go to Firebase Console → Firestore
   - [ ] Check database is created and active
   - [ ] Check collections exist (users, workTypes, workRecords)
   - [ ] Wait a few seconds - Firestore may be initializing
   - [ ] Check browser console (DevTools) for errors

3. **"Real-time updates not working"**
   - [ ] Check that listeners are being created (console logs)
   - [ ] Test with simple create - wait 2-3 seconds
   - [ ] Check that both windows/tabs have same Firebase project
   - [ ] Check firewall/proxy isn't blocking Firestore

4. **"Permission denied" errors in console**
   - [ ] Firestore rules may be too restrictive
   - [ ] Switch back to Test mode temporarily
   - [ ] Check security rules in Firebase Console

5. **"npm install failed"**
   - [ ] Make sure Node.js 16+ installed: `node -v`
   - [ ] Try: `npm cache clean --force`
   - [ ] Try again: `npm install`
   - [ ] If still fails, delete `node_modules` and `package-lock.json`, reinstall

## Success Checklist

You're done when:
- [ ] App loads without errors
- [ ] Can see Firebase Console with data
- [ ] Can create users/types/records
- [ ] Real-time sync works (changes in 2 windows)
- [ ] Data persists after restart
- [ ] All 3 collection types have data in Firebase

## Next Actions

1. **Start using the app** with your team
2. **Test different scenarios** and edge cases
3. **Set up proper Firestore rules** when ready for production
4. **Add Firebase Authentication** for better security
5. **Monitor Firestore usage** to stay within free tier

## Support

- **Firebase Issues**: Check https://firebase.google.com/docs
- **App Issues**: Review FIREBASE_SETUP.md and REFACTORING_SUMMARY.md
- **Questions**: Use GitHub Copilot in your IDE for code help

---

**Last Updated**: February 27, 2026
**Firebase SDK Version**: 11.2.2
**Status**: Ready for Production (with security rules)
