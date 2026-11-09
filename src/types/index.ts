export type UserRole = 'admin' | 'student';

export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string; // Must end with @usmba.ac.ma
  department: string; // Filière / Faculté
  classLevel: string; // e.g., Licence 3 SMI, Master 1 ISI
  status: 'active' | 'inactive';
  phone?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  title?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  description: string;
  coverUrl?: string;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  location?: string; // Rayon / Étagère
  createdAt: string;
}

export interface Loan {
  id: string;
  studentId: string;
  bookId: string;
  loanDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD if returned
  status: 'active' | 'returned';
  daysOverdueAtReturn?: number;
}

export type DelaySeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface DelayInfo {
  days: number;
  severity: DelaySeverity;
  label: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

export interface AppSettings {
  defaultLoanDurationDays: number;
  thresholdLow: number; // e.g. 1-3 days
  thresholdMedium: number; // e.g. 4-7 days
  thresholdHigh: number; // e.g. 8-14 days
  thresholdCritical: number; // e.g. 15+ days
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  libraryName: string;
  universityName: string;
  campus: string;
  contactEmail: string;
}

export interface SentEmail {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  bookTitle: string;
  daysLate: number;
  subject: string;
  body: string;
  sentAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
