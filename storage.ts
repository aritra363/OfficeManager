
import { User, UserRole, WorkType, WorkRecord } from './types';
import { firebaseService } from './firebaseService';

/**
 * Storage Service - Wrapper around Firebase Firestore
 * Provides async methods for all data operations
 */
export const Storage = {
  // User Methods
  getUsers: async (): Promise<User[]> => {
    return await firebaseService.getUsers();
  },
  
  saveUsers: async (users: User[]): Promise<void> => {
    return await firebaseService.saveUsers(users);
  },

  saveUser: async (user: User): Promise<void> => {
    return await firebaseService.saveUser(user);
  },

  deleteUser: async (userId: string): Promise<void> => {
    return await firebaseService.deleteUser(userId);
  },

  // Work Type Methods
  getWorkTypes: async (): Promise<WorkType[]> => {
    return await firebaseService.getWorkTypes();
  },

  saveWorkTypes: async (types: WorkType[]): Promise<void> => {
    return await firebaseService.saveWorkTypes(types);
  },

  saveWorkType: async (workType: WorkType): Promise<void> => {
    return await firebaseService.saveWorkType(workType);
  },

  deleteWorkType: async (workTypeId: string): Promise<void> => {
    return await firebaseService.deleteWorkType(workTypeId);
  },

  // Work Record Methods
  getWorkRecords: async (): Promise<WorkRecord[]> => {
    return await firebaseService.getWorkRecords();
  },

  saveWorkRecords: async (records: WorkRecord[]): Promise<void> => {
    return await firebaseService.saveWorkRecords(records);
  },

  saveWorkRecord: async (record: WorkRecord): Promise<void> => {
    return await firebaseService.saveWorkRecord(record);
  },

  deleteWorkRecord: async (recordId: string): Promise<void> => {
    return await firebaseService.deleteWorkRecord(recordId);
  },

  getRecordsByWorkType: async (workTypeId: string): Promise<WorkRecord[]> => {
    return await firebaseService.getRecordsByWorkType(workTypeId);
  },

  getRecordsByEmployee: async (employeeId: string): Promise<WorkRecord[]> => {
    return await firebaseService.getRecordsByEmployee(employeeId);
  },

  // Real-time Subscriptions
  subscribeToUsers: (callback: (users: User[]) => void) => {
    return firebaseService.subscribeToUsers(callback);
  },

  subscribeToWorkTypes: (callback: (workTypes: WorkType[]) => void) => {
    return firebaseService.subscribeToWorkTypes(callback);
  },

  subscribeToWorkRecords: (callback: (records: WorkRecord[]) => void) => {
    return firebaseService.subscribeToWorkRecords(callback);
  },

  // Initialize Firebase
  initialize: async () => {
    return await firebaseService.initialize();
  }
};
