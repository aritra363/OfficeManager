// Firebase Configuration
// Get these values from your Firebase project settings

console.log('🔧 Loading Firebase Configuration...');
console.log('Environment variables available:', {
  VITE_FIREBASE_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: !!import.meta.env.VITE_FIREBASE_APP_ID
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

console.log('📋 Firebase Config Loaded:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 10)}...` : '✗ MISSING',
  authDomain: firebaseConfig.authDomain || '✗ MISSING',
  projectId: firebaseConfig.projectId || '✗ MISSING',
  storageBucket: firebaseConfig.storageBucket || '✗ MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId || '✗ MISSING',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.slice(0, 10)}...` : '✗ MISSING'
});

// Validate that all required fields are set
if (!firebaseConfig.projectId) {
  console.error('❌ CRITICAL: Firebase credentials not loaded! Check .env.local file');
  console.error('Required fields:', {
    apiKey: firebaseConfig.apiKey ? '✓' : '✗',
    authDomain: firebaseConfig.authDomain ? '✓' : '✗',
    projectId: firebaseConfig.projectId ? '✓' : '✗',
    storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
    appId: firebaseConfig.appId ? '✓' : '✗'
  });
} else {
  console.log('✅ Firebase credentials loaded successfully');
}

export default firebaseConfig;
