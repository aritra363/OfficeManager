import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { User, UserRole, WorkType, WorkRecord } from './types';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
console.log('🔥 Initializing Firebase App with config:', firebaseConfig.projectId ? `Project: ${firebaseConfig.projectId}` : 'NO CONFIG');
let app, db, auth;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialized');
  db = getFirestore(app);
  console.log('✅ Firestore database connected');
  auth = getAuth(app);
  console.log('✅ Firebase Auth connected');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

const COLLECTIONS = {
  USERS: 'users',
  WORK_TYPES: 'workTypes',
  WORK_RECORDS: 'workRecords'
};

// Manual user creation via Firebase Console - no automatic creation
// const INITIAL_ADMIN: User = {
//   id: 'admin-0',
//   username: 'admin',
//   password: 'Aritra@1234',
//   name: 'System Admin',
//   role: UserRole.ADMIN,
//   createdAt: Date.now()
// };

class FirebaseService {
  private userUnsub: Unsubscribe | null = null;
  private workTypesUnsub: Unsubscribe | null = null;
  private recordsUnsub: Unsubscribe | null = null;

  /**
   * Initialize Firebase (no automatic user creation)
   */
  async initialize(): Promise<void> {
    try {
      // Test Firebase connection by fetching users
      const users = await this.getUsers();
      console.log('✅ Firebase Firestore connected successfully');
      console.log(`📊 Loaded ${users.length} users from database`);
      // Just initialize - don't create any users automatically
      // Users must be created manually via Firebase Console
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      throw error;
    }
  }

  /**
   * User Management
   */
  async getUsers(): Promise<User[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return snapshot.docs.map(doc => this.firestoreToUser(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async saveUsers(users: User[]): Promise<void> {
    try {
      for (const user of users) {
        await setDoc(doc(db, COLLECTIONS.USERS, user.id), this.userToFirestore(user));
      }
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      console.log(`💾 Saving user: ${user.username} (${user.id})`);
      const firestoreData = this.userToFirestore(user);
      console.log('📝 Firestore data:', firestoreData);
      await setDoc(doc(db, COLLECTIONS.USERS, user.id), firestoreData);
      console.log(`✅ User ${user.username} saved successfully to Firebase`);
    } catch (error) {
      console.error(`❌ Error saving user ${user.username}:`, error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Work Types Management
   */
  async getWorkTypes(): Promise<WorkType[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.WORK_TYPES));
      return snapshot.docs.map(doc => this.firestoreToWorkType(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching work types:', error);
      return [];
    }
  }

  async saveWorkTypes(workTypes: WorkType[]): Promise<void> {
    try {
      for (const workType of workTypes) {
        await setDoc(doc(db, COLLECTIONS.WORK_TYPES, workType.id), this.workTypeToFirestore(workType));
      }
    } catch (error) {
      console.error('Error saving work types:', error);
      throw error;
    }
  }

  async saveWorkType(workType: WorkType): Promise<void> {
    try {
      console.log(`💾 Saving work type: ${workType.name} (${workType.id})`);
      const firestoreData = this.workTypeToFirestore(workType);
      console.log('📝 Firestore data:', firestoreData);
      await setDoc(doc(db, COLLECTIONS.WORK_TYPES, workType.id), firestoreData);
      console.log(`✅ Work type ${workType.name} saved successfully to Firebase`);
    } catch (error) {
      console.error(`❌ Error saving work type ${workType.name}:`, error);
      throw error;
    }
  }

  async deleteWorkType(workTypeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.WORK_TYPES, workTypeId));
    } catch (error) {
      console.error('Error deleting work type:', error);
      throw error;
    }
  }

  /**
   * Work Records Management
   */
  async getWorkRecords(): Promise<WorkRecord[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.WORK_RECORDS));
      return snapshot.docs.map(doc => this.firestoreToWorkRecord(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching work records:', error);
      return [];
    }
  }

  async saveWorkRecords(records: WorkRecord[]): Promise<void> {
    try {
      for (const record of records) {
        await setDoc(doc(db, COLLECTIONS.WORK_RECORDS, record.id), this.workRecordToFirestore(record));
      }
    } catch (error) {
      console.error('Error saving work records:', error);
      throw error;
    }
  }

  async saveWorkRecord(record: WorkRecord): Promise<void> {
    try {
      console.log(`💾 Saving work record: ${record.id}`);
      const firestoreData = this.workRecordToFirestore(record);
      console.log('📝 Firestore data:', firestoreData);
      await setDoc(doc(db, COLLECTIONS.WORK_RECORDS, record.id), firestoreData);
      console.log(`✅ Work record ${record.id} saved successfully to Firebase`);
    } catch (error) {
      console.error(`❌ Error saving work record ${record.id}:`, error);
      throw error;
    }
  }

  async deleteWorkRecord(recordId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.WORK_RECORDS, recordId));
    } catch (error) {
      console.error('Error deleting work record:', error);
      throw error;
    }
  }

  async getRecordsByWorkType(workTypeId: string): Promise<WorkRecord[]> {
    try {
      const q = query(collection(db, COLLECTIONS.WORK_RECORDS), where('workTypeId', '==', workTypeId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.firestoreToWorkRecord(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching records by work type:', error);
      return [];
    }
  }

  async getRecordsByEmployee(employeeId: string): Promise<WorkRecord[]> {
    try {
      const q = query(collection(db, COLLECTIONS.WORK_RECORDS), where('employeeId', '==', employeeId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.firestoreToWorkRecord(doc.data(), doc.id));
    } catch (error) {
      console.error('Error fetching records by employee:', error);
      return [];
    }
  }

  /**
   * Authentication Methods (Optional - if you want to use Firebase Auth)
   */
  async authenticateUser(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async createAuthUser(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('User creation error:', error);
      return null;
    }
  }

  /**
   * Real-time Listeners
   */
  subscribeToUsers(callback: (users: User[]) => void): Unsubscribe {
    return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
      const users = snapshot.docs.map(doc => this.firestoreToUser(doc.data(), doc.id));
      callback(users);
    });
  }

  subscribeToWorkTypes(callback: (workTypes: WorkType[]) => void): Unsubscribe {
    return onSnapshot(collection(db, COLLECTIONS.WORK_TYPES), (snapshot) => {
      const workTypes = snapshot.docs.map(doc => this.firestoreToWorkType(doc.data(), doc.id));
      callback(workTypes);
    });
  }

  subscribeToWorkRecords(callback: (records: WorkRecord[]) => void): Unsubscribe {
    return onSnapshot(collection(db, COLLECTIONS.WORK_RECORDS), (snapshot) => {
      const records = snapshot.docs.map(doc => this.firestoreToWorkRecord(doc.data(), doc.id));
      callback(records);
    });
  }

  unsubscribeAll(): void {
    if (this.userUnsub) this.userUnsub();
    if (this.workTypesUnsub) this.workTypesUnsub();
    if (this.recordsUnsub) this.recordsUnsub();
  }

  /**
   * Data Conversion Helpers
   */
  private userToFirestore(user: User): Record<string, any> {
    return {
      id: user.id,
      username: user.username,
      password: user.password, // Note: Should be hashed in production
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  private firestoreToUser(data: any, id: string): User {
    return {
      id: data.id || id,
      username: data.username,
      password: data.password,
      name: data.name,
      role: data.role as UserRole,
      createdAt: data.createdAt
    };
  }

  private workTypeToFirestore(workType: WorkType): Record<string, any> {
    return {
      id: workType.id,
      name: workType.name,
      description: workType.description,
      fields: workType.fields,
      createdAt: workType.createdAt
    };
  }

  private firestoreToWorkType(data: any, id: string): WorkType {
    return {
      id: data.id || id,
      name: data.name,
      description: data.description,
      fields: data.fields || [],
      createdAt: data.createdAt
    };
  }

  private workRecordToFirestore(record: WorkRecord): Record<string, any> {
    return {
      id: record.id,
      workTypeId: record.workTypeId,
      employeeId: record.employeeId,
      data: record.data,
      deactivatedFields: record.deactivatedFields || [],
      createdAt: record.createdAt,
      lastUpdated: record.lastUpdated
    };
  }

  private firestoreToWorkRecord(data: any, id: string): WorkRecord {
    return {
      id: data.id || id,
      workTypeId: data.workTypeId,
      employeeId: data.employeeId,
      data: data.data || {},
      deactivatedFields: data.deactivatedFields || [],
      createdAt: data.createdAt,
      lastUpdated: data.lastUpdated
    };
  }
}

export const firebaseService = new FirebaseService();
export { db, auth };
