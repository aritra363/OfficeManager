# Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Office Manager App                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │  │
│  │  │   App.tsx   │  │  Components  │  │   State Management│  │  │
│  │  │             │  │  - Login     │  │   - users         │  │  │
│  │  │ Initialize  │  │  - Dashboard │  │   - workTypes     │  │  │
│  │  │ Firebase    │  │  - Forms     │  │   - records       │  │  │
│  │  │             │  │  - Lists     │  │                   │  │  │
│  │  └──────┬──────┘  └──────────────┘  └───────────────────┘  │  │
│  └─────────┼──────────────────────────────────────────────────┘  │
│            │                                                        │
│            │ Async API Calls                                      │
│            │ Real-time Listeners                                  │
│            ▼                                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Storage Layer                             │  │
│  │  storage.ts - Async wrapper around Firebase                 │  │
│  │  - getUsers/saveUser                                        │  │
│  │  - getWorkTypes/saveWorkType                                │  │
│  │  - getWorkRecords/saveWorkRecord                            │  │
│  │  - subscribeToXxx (real-time listeners)                     │  │
│  └──────────┬──────────────────────────────────────────────────┘  │
│             │                                                       │
│             │ Firebase SDK Calls                                  │
│             ▼                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Firebase Service                            │  │
│  │  firebaseService.ts                                         │  │
│  │  - Initialize app & database                               │  │
│  │  - CRUD operations                                         │  │
│  │  - Real-time subscriptions (onSnapshot)                    │  │
│  │  - Data conversion helpers                                 │  │
│  └──────────┬──────────────────────────────────────────────────┘  │
│             │                                                       │
│             │ Network (HTTPS)                                     │
│             ▼                                                       │
└─────────────┼───────────────────────────────────────────────────┘
              │
              │
┌─────────────┴──────────────────────────────────────────────────────┐
│                      Cloud Infrastructure                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Firebase Project                          │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │            Firestore Database                        │  │  │
│  │  │  ┌──────────────┬──────────────┬─────────────────┐  │  │  │
│  │  │  │    users     │  workTypes   │  workRecords    │  │  │  │
│  │  │  │  Collection  │  Collection  │  Collection     │  │  │  │
│  │  │  │              │              │                 │  │  │  │
│  │  │  │ - admin-0    │ - type-1     │ - record-1      │  │  │  │
│  │  │  │ - user-1     │ - type-2     │ - record-2      │  │  │  │
│  │  │  │ - user-2     │ - type-3     │ - record-3      │  │  │  │
│  │  │  └──────────────┴──────────────┴─────────────────┘  │  │  │
│  │  │                                                        │  │  │
│  │  │  Real-time Listeners (WebSockets)                     │  │  │
│  │  │  - Push updates to connected clients                  │  │  │
│  │  │  - Instant synchronization across devices             │  │  │
│  │  │  - Automatic scaling (Firebase managed)               │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │         Security & Backups                           │  │  │
│  │  │ - Firestore Rules (access control)                   │  │  │
│  │  │ - Automatic daily backups                            │  │  │
│  │  │ - Data encryption at rest & in transit               │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow - Create Work Record

```
┌──────────┐
│ Employee │
│  Client  │
└────┬─────┘
     │ 1. Click "Create Work Record"
     ▼
┌─────────────────────┐
│  WorkEntryForm.tsx  │
│ (fills form fields) │
└────┬────────────────┘
     │ 2. User clicks "Save"
     ▼
┌──────────────────────────────────────┐
│ App.tsx onSave handler               │
│ Creates WorkRecord object            │
│ Calls firebaseService.saveWorkRecord │
└────┬─────────────────────────────────┘
     │ 3. Save to Firebase
     ▼
┌──────────────────────────────────────────┐
│ firebaseService.saveWorkRecord()         │
│ Converts object & uploads to Firestore   │
└────┬─────────────────────────────────────┘
     │ 4. HTTPS request to Firebase
     ▼
┌────────────────────────────────────────────┐
│ Firebase Firestore                         │
│ workRecords/{recordId}                     │
│ ├── id: record-1708099935000              │
│ ├── workTypeId: type-1                     │
│ ├── employeeId: user-1                     │
│ ├── data: { field1: value1, ... }          │
│ └── lastUpdated: 1708099935000             │
└────┬─────────────────────────────────────┘
     │ 5. Real-time listener triggered
     │
     ├─→ Admin Client (subscribed)
     │   └── Updates records state → re-renders AdminDashboard
     │
     ├─→ Employee A (subscribed)
     │   └── Updates records state → re-renders EmployeeDashboard
     │
     └─→ Employee B (subscribed)
         └── Updates records state → re-renders instantly
```

## Real-Time Sync Flow

```
Client 1                Firebase                  Client 2
┌────────┐             ┌────────┐              ┌────────┐
│ Edit   │             │        │              │ Listen │
│Record  │             │        │              │        │
└───┬────┘             └────────┘              └────┬───┘
    │                      ▲                         │
    │ saveWorkRecord()     │                         │
    │─────────────────────►│                         │
    │                      │                         │
    │                      │ onSnapshot fires       │
    │                      │─────────────────────────►│
    │                      │                         │
    │                      │                   setRecords()
    │                      │                   │
    │                      │                   ▼
    │                      │              Re-render with
    │                      │              new data
```

## Component Hierarchy

```
App (State: users, workTypes, records, user, activeTab)
├── LoginPage (No auth)
│   └── LoginForm
│
├── Layout (When user logged in)
│   ├── Navigation (role-based)
│   │   └── Tabs based on role
│   │
│   └── Content (based on activeTab)
│       ├── [ADMIN ROUTES]
│       │   ├── AdminDashboard
│       │   │   └── NotificationsList
│       │   │
│       │   ├── EmployeeManager
│       │   │   ├── EmployeeForm
│       │   │   └── EmployeeList
│       │   │
│       │   ├── WorkTypeBuilder
│       │   │   ├── FieldBuilder
│       │   │   └── WorkTypeList
│       │   │
│       │   └── RecordList (all records)
│       │       └── RecordCard
│       │
│       └── [EMPLOYEE ROUTES]
│           ├── EmployeeDashboard
│           │   └── NotificationsList
│           │
│           ├── WorkEntryForm
│           │   └── DynamicFields (based on WorkType)
│           │
│           └── RecordList (filtered)
│               └── RecordCard
```

## File Dependencies

```
index.tsx
└── App.tsx
    ├── firebaseService.ts
    │   ├── firebaseConfig.ts
    │   └── Firebase SDK
    │
    ├── storage.ts
    │   └── firebaseService.ts
    │
    └── Components
        ├── LoginPage.tsx
        ├── Layout.tsx
        ├── AdminDashboard.tsx
        ├── EmployeeDashboard.tsx
        ├── EmployeeManager.tsx
        ├── WorkTypeBuilder.tsx
        ├── WorkEntryForm.tsx
        ├── RecordList.tsx
        └── SafeDeleteModal.tsx

server.ts
├── express
└── vite
```

## Technology Stack Visualization

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│  React 19 + TypeScript + Tailwind CSS           │
│  - Interactive UI Components                    │
│  - State Management (useState/useEffect)        │
│  - Real-time Notifications (react-hot-toast)   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Application Layer                  │
│  Express.js Server                             │
│  - Vite dev server                             │
│  - Static file serving                         │
│  - API routing (optional)                      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Data Access Layer                  │
│  Firebase Service + Storage Wrapper            │
│  - firebaseService.ts (core operations)        │
│  - storage.ts (simplified API)                 │
│  - Type conversions & helpers                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Backend/Database Layer             │
│  Google Firebase                               │
│  - Firestore (NoSQL Database)                  │
│  - Real-time Listeners                         │
│  - Authentication (optional)                   │
│  - Hosting (optional)                          │
│  - Backups & Security                          │
└──────────────────────────────────────────────────┘
```

## Deployment Architecture

```
Developer Machine
  ↓
  npm run dev (localhost:3000)
  │
  ├── Vite Dev Server
  ├── Tailwind/TypeScript compilation
  └── Firebase connection

    ↓ When ready for production

┌─────────────────────────────────────────┐
│        npm run build                    │
│        Creates /dist folder             │
│        Minified & optimized assets      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  Deployment Target │
          │  - Firebase Hosting│
          │  - Vercel          │
          │  - Your own server │
          │  - Docker          │
          └────────────────────┘
                   │
                   ▼
          ┌────────────────────┐
          │   Production Env   │
          │  .env.local (prod) │
          │  Security rules OK │
          │  Auth enabled      │
          └────────────────────┘
```

## Key Design Patterns

### 1. **Real-time Subscriptions**
```
Subscribe to collection in useEffect
  ↓
Firestore sends initial data + updates
  ↓
Update React state
  ↓
Component re-renders
  ↓
Unsubscribe on unmount
```

### 2. **Async State Updates**
```
User action (button click)
  ↓
Call async firebaseService method
  ↓
Wait for Firebase response
  ↓
Update UI (via real-time listener)
  ↓
Show toast notification
```

### 3. **Data Isolation**
```
Users only see:
  ├── Their own records (employees)
  └── All records (admins)

Security enforced:
  ├── Firestore rules (backend)
  └── Component logic (frontend)
```

---

This architecture provides scalability, real-time synchronization, and cloud-based persistence while maintaining a clean separation of concerns.
