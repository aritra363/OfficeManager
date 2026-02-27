<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Tax & License Office Manager

A modern web application for managing office work, licenses, and tax documents with real-time collaboration.

## Features

- **User Management**: Admin and employee roles
- **Custom Work Types**: Define flexible document categories with custom fields
- **Smart Notifications**: Automatic reminders for expiring licenses and documents
- **Real-Time Sync**: Changes synchronize instantly across all users via Firebase
- **Document Tracking**: Track work history and document statuses
- **Role-Based Access**: Different views and permissions for admins and employees

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Express.js
- **Database**: Firebase Firestore
- **Real-time**: Firebase Firestore listeners
- **API**: Gemini API integration (optional)

## Quick Start

### Prerequisites
- Node.js 16+
- Firebase project

### Installation

1. **Clone and setup**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase credentials
   - See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Default Credentials

On first run:
- **Username**: admin@officemanager.local
- **Password**: hashed-admin-password (change this in Firebase Console)

## Project Structure

```
├── App.tsx                 # Main component with Firebase integration
├── firebaseConfig.ts       # Firebase configuration
├── firebaseService.ts      # Database operations & real-time listeners
├── storage.ts              # Storage API (Firebase wrapper)
├── server.ts               # Express server
├── types.ts                # TypeScript interfaces
├── components/
│   ├── AdminDashboard.tsx
│   ├── EmployeeDashboard.tsx
│   ├── EmployeeManager.tsx
│   ├── WorkTypeBuilder.tsx
│   ├── WorkEntryForm.tsx
│   ├── RecordList.tsx
│   ├── LoginPage.tsx
│   ├── Layout.tsx
│   └── SafeDeleteModal.tsx
└── vite.config.ts          # Vite configuration
```

## Building for Production

```bash
npm run build
npm run preview
```

## Environment Variables

Create `.env.local` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_key
```

See `.env.local.example` for template.

## Firebase Setup

For complete Firebase configuration instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

Quick steps:
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Get your config from Project Settings
4. Add to `.env.local`

## Database Collections

### users
- User profiles with roles (admin/employee)
- Credentials and metadata

### workTypes
- Custom document/work type definitions
- Field configurations and validation rules

### workRecords
- Individual work entries and documents
- Associated data and timestamps

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#database-structure) for schema details.

## Real-Time Features

All data changes are instantly synchronized across connected clients:
- Multiple users see updates in real-time
- No refresh needed
- Changes from any client reflected everywhere

## API Overview

See `firebaseService.ts` for full API. Key methods:

```typescript
// Users
Storage.getUsers()
Storage.saveUser(user)
Storage.deleteUser(userId)

// Work Types
Storage.getWorkTypes()
Storage.saveWorkType(type)

// Records
Storage.getWorkRecords()
Storage.saveWorkRecord(record)
Storage.getRecordsByEmployee(employeeId)
```

## Security

- Test mode enabled by default (development)
- Configure Firestore rules for production
- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#security-considerations) for rules

## Troubleshooting

- **Connection issues**: Check Firebase credentials
- **No data**: Verify Firestore database created
- **Real-time not working**: Check browser console for errors

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#troubleshooting) for more help.

## License

MIT

## Support

For Firebase help, visit:
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
