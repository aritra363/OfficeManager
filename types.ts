
export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  CHECKBOX = 'checkbox'
}

export enum NotificationType {
  NONE = 'none',
  ALERT = 'alert',
  EXPIRY = 'expiry'
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  notificationType: NotificationType;
  isExpiry: boolean; // Explicit flag for expiry tracking
  isSearchable: boolean; // Admin can mark fields as searchable
  isPrimary: boolean; // Used for identifying records (e.g., Customer Name)
  options?: string[]; // For select type
}

export interface WorkType {
  id: string;
  name: string;
  description: string;
  fields: FieldDefinition[];
  createdAt: number;
}

export interface WorkRecord {
  id: string;
  workTypeId: string;
  employeeId: string;
  data: Record<string, any>;
  deactivatedFields?: string[]; // IDs of fields whose notifications are deactivated
  createdAt: number;
  lastUpdated: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: number;
}

export interface Notification {
  id: string;
  recordId: string;
  workTypeName: string;
  primaryValue: string;
  dateValue: string;
  daysRemaining: number;
  type: 'urgent' | 'warning' | 'info';
  notificationType: NotificationType;
  message: string;
}
