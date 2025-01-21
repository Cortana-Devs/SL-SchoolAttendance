export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  class: string;
  grade: string;
  createdAt: number;
  updatedAt: number;
}

export type StudentFormData = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;

export interface Class {
  id: string;
  name: string;
  grade: string;
}

export type FirebaseError = {
  code: string;
  message: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  class: string;
  grade: string;
  records: {
    [studentId: string]: {
      present: boolean;
      timestamp: number;
      markedBy: string;
      markedTime: string;
      note?: string;
      isLateArrival?: boolean;
      leftEarly?: boolean;
      isExcused?: boolean;
      absenceReason?: string;
    };
  };
  lastModified: number;
  submitted: boolean;
  section?: 'Primary' | 'Middle' | 'Upper';
  submittedBy?: string;
  totalPresent?: number;
  totalAbsent?: number;
  totalLate?: number;
  totalExcused?: number;
  schoolDayType?: 'Regular' | 'Half-Day' | 'Special Event';
  period?: 'Morning' | 'Afternoon';
  academicYear?: string;
}

export interface AttendanceStatus {
  studentId: string;
  present: boolean;
  note?: string;
  isLateArrival?: boolean;
  leftEarly?: boolean;
  isExcused?: boolean;
  absenceReason?: string;
}

export type UserRole = 'admin' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
} 