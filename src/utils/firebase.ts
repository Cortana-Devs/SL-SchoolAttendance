import { ref, set, get, query, orderByChild, startAt, endAt, getDatabase } from 'firebase/database';
import { database } from '../config/firebase';
import { Student, StudentFormData, AttendanceRecord, AttendanceStatus } from '../types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// Helper function to handle Firebase errors with custom messages
const handleError = (error: any, customMessage: string) => {
  console.error(customMessage, error);
  if (error.code === 'PERMISSION_DENIED') {
    return new Error('You do not have permission to perform this action. Please check your role and try again.');
  }
  return error;
};

export const addStudent = async (data: StudentFormData): Promise<Student> => {
  try {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    const student: Student = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await set(ref(database, `students/${id}`), student);
    return student;
  } catch (error) {
    throw handleError(error, 'Error adding student:');
  }
};

export const getStudents = async (): Promise<Student[]> => {
  console.log('getStudents: Starting to fetch students...');
  try {
    const snapshot = await get(ref(database, 'students'));
    console.log('getStudents: Got snapshot:', snapshot.exists());
    
    if (!snapshot.exists()) {
      console.log('getStudents: No students found in database');
      return [];
    }
    
    const studentsData = snapshot.val();
    console.log('getStudents: Raw data:', studentsData);
    
    const students = Object.values(studentsData as Record<string, Student>);
    console.log('getStudents: Processed students:', students);
    return students;
  } catch (error) {
    console.error('getStudents: Error fetching students:', error);
    throw error;
  }
};

export const searchStudents = async (name: string): Promise<Student[]> => {
  const searchQuery = query(
    ref(database, 'students'),
    orderByChild('name'),
    startAt(name.toLowerCase()),
    endAt(name.toLowerCase() + '\uf8ff')
  );

  const snapshot = await get(searchQuery);
  if (!snapshot.exists()) return [];

  return Object.values(snapshot.val() as Record<string, Student>);
};

export const getStudentsByGrade = async (grade: string, selectedClass?: string): Promise<Student[]> => {
  const gradeQuery = query(
    ref(database, 'students'),
    orderByChild('grade'),
    startAt(grade),
    endAt(grade + '\uf8ff')
  );

  const snapshot = await get(gradeQuery);
  if (!snapshot.exists()) return [];

  const students = Object.values(snapshot.val() as Record<string, Student>);
  return selectedClass 
    ? students.filter(student => student.class === selectedClass)
    : students;
};

export const saveAttendance = async (
  date: string,
  classId: string,
  grade: string,
  records: AttendanceStatus[]
): Promise<void> => {
  const attendanceRef = ref(database, `attendance/${date}/${classId}`);
  const timestamp = Date.now();
  
  // Format records with simplified attendance details
  const formattedRecords = records.reduce((acc, record) => {
    acc[record.studentId] = {
      present: record.present,
      timestamp,
      markedBy: auth.currentUser?.email || 'unknown',
      markedTime: new Date().toLocaleTimeString(),
      note: record.note || ''
    };
    return acc;
  }, {} as Record<string, {
    present: boolean;
    timestamp: number;
    markedBy: string;
    markedTime: string;
    note?: string;
  }>);

  // Add metadata about the attendance record
  await set(attendanceRef, {
    id: `${date}_${classId}`,
    date,
    class: classId,
    grade,
    records: formattedRecords,
    lastModified: timestamp,
    submitted: true,
    section: grade.includes('1') || grade.includes('2') || grade.includes('3') || grade.includes('4') || grade.includes('5') 
      ? 'Primary' 
      : grade.includes('6') || grade.includes('7') || grade.includes('8')
      ? 'Middle'
      : 'Upper',
    submittedBy: auth.currentUser?.email || 'unknown',
    totalPresent: Object.values(formattedRecords).filter(r => r.present).length,
    totalAbsent: Object.values(formattedRecords).filter(r => !r.present).length,
    schoolDayType: 'Regular',
    period: 'Morning',
    academicYear: new Date(date).getFullYear().toString()
  });
};

export const getDraftAttendance = async (
  date: string,
  classId: string
): Promise<AttendanceRecord | null> => {
  console.log('=== START getDraftAttendance ===');
  console.log('Loading attendance for:', { date, classId });
  
  try {
    // Get the entire attendance record for the date and class
    const attendanceRef = ref(database, `attendance/${date}/${classId}`);
    const snapshot = await get(attendanceRef);
    
    if (!snapshot.exists()) {
      console.log('No attendance record found');
      return null;
    }

    const data = snapshot.val();
    console.log('Raw attendance data:', data);

    // Format the data to match the expected structure
    const formattedData = {
      id: data.id,
      date: data.date,
      class: data.class,
      grade: data.grade,
      lastModified: data.lastModified,
      totalPresent: data.totalPresent || 0,
      totalAbsent: data.totalAbsent || 0,
      submitted: data.submitted || false,
      records: data.records ? Object.entries(data.records).reduce((acc, [studentId, record]: [string, any]) => {
        acc[studentId] = {
          present: Boolean(record.present),
          timestamp: record.timestamp,
          markedBy: record.markedBy,
          markedTime: record.markedTime
        };
        return acc;
      }, {} as Record<string, any>) : {}
    };

    console.log('Formatted attendance data:', formattedData);
    console.log('=== END getDraftAttendance - Success ===');
    return formattedData;
  } catch (error) {
    console.error('Error in getDraftAttendance:', error);
    console.log('=== END getDraftAttendance - Error ===');
    throw error;
  }
};

export const saveDraftAttendance = async (
  date: string,
  classId: string,
  grade: string,
  records: AttendanceStatus[]
): Promise<void> => {
  console.log('=== START saveDraftAttendance ===');
  console.log('Saving attendance for:', { date, classId, grade });
  console.log('Records:', records);

  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to mark attendance');
    }

    // Check user role first
    const userRole = await getUserRole(auth.currentUser.uid);
    if (!userRole || (userRole !== 'admin' && userRole !== 'teacher')) {
      throw new Error('You do not have permission to mark attendance. Only teachers and admins can mark attendance.');
    }

    const attendanceRef = ref(database, `attendance/${date}/${classId}`);
    const timestamp = Date.now();

    // Format all records at once
    const formattedRecords = records.reduce((acc, record) => {
      acc[record.studentId] = {
        present: record.present,
        timestamp: timestamp,
        markedBy: auth.currentUser?.email || 'unknown',
        markedTime: new Date().toLocaleTimeString(),
        note: record.note || '',
        lastModifiedBy: auth.currentUser?.email || 'unknown',
        lastModifiedAt: timestamp
      };
      return acc;
    }, {} as Record<string, any>);

    // Save both metadata and records in a single write
    const attendanceData = {
      id: `${date}_${classId}`,
      date,
      class: classId,
      grade,
      lastModified: timestamp,
      lastModifiedBy: auth.currentUser?.email || 'unknown',
      totalPresent: records.filter(r => r.present).length,
      totalAbsent: records.filter(r => !r.present).length,
      records: formattedRecords,
      section: grade.includes('1') || grade.includes('2') || grade.includes('3') || grade.includes('4') || grade.includes('5') 
        ? 'Primary' 
        : grade.includes('6') || grade.includes('7') || grade.includes('8')
        ? 'Middle'
        : grade.includes('12') || grade.includes('13')
        ? 'Advanced'
        : 'Upper'
    };

    console.log('Saving attendance data:', attendanceData);
    await set(attendanceRef, attendanceData);

    // Verify the save
    const verifySnapshot = await get(attendanceRef);
    if (verifySnapshot.exists()) {
      console.log('Verification - Data saved successfully:', verifySnapshot.val());
    } else {
      console.error('Verification failed - No data found after save');
    }

    console.log('=== END saveDraftAttendance - Success ===');
  } catch (error) {
    console.error('Error in saveDraftAttendance:', error);
    console.log('=== END saveDraftAttendance - Error ===');
    throw error;
  }
};

export const setupTeacherAccount = async () => {
  try {
    const email = 'teacher@attendancemarkin.com';
    const password = 'teacher123';
    
    // Create teacher account if it doesn't exist
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // If user already exists, that's fine
      if (error.code !== 'auth/email-already-in-use') {
        throw error;
      }
    }

    // Set teacher role in database
    await set(ref(database, `users/${auth.currentUser?.uid}`), {
      email,
      role: 'teacher',
      createdAt: Date.now()
    });
  } catch (error) {
    console.error('Error setting up teacher account:', error);
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Check if user exists in the database
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // If user doesn't exist in database, set up their role based on email
      const role = email.includes('admin') ? 'admin' : 'teacher';
      await set(userRef, {
        email: user.email,
        role,
        createdAt: Date.now()
      });
    }

    return userCredential;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserRole = async (uid: string): Promise<'admin' | 'teacher' | null> => {
  try {
    if (!uid) {
      console.error('No UID provided to getUserRole');
      return null;
    }

    if (!auth.currentUser) {
      console.error('No authenticated user');
      return null;
    }

    console.log('Getting role for uid:', uid);
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    console.log('User data snapshot:', snapshot.val());
    
    if (!snapshot.exists()) {
      console.log('No user data found, attempting to create user data');
      
      if (!auth.currentUser.email) {
        console.error('No email found for authenticated user');
        return null;
      }

      // Determine role based on email
      const role = auth.currentUser.email.includes('admin') ? 'admin' : 'teacher';
      const userData = {
        email: auth.currentUser.email,
        role,
        createdAt: Date.now()
      };

      try {
        await set(userRef, userData);
        console.log('Created user data:', userData);
        
        // Store role in localStorage for faster access
        localStorage.setItem('userRole', role);
        
        return role;
      } catch (error) {
        console.error('Error creating user data:', error);
        return null;
      }
    }
    
    const userData = snapshot.val();
    if (!userData.role) {
      console.error('User data exists but no role found');
      return null;
    }

    // Store role in localStorage for faster access
    localStorage.setItem('userRole', userData.role);
    
    console.log('Returning role:', userData.role);
    return userData.role;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

export const setupInitialAccounts = async () => {
  try {
    const db = getDatabase();
    
    // First, clean up any existing incorrect user entries
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      // Remove entries with hardcoded UIDs
      if (users.admin123uid) {
        await set(ref(db, 'users/admin123uid'), null);
      }
      if (users.teacher123uid) {
        await set(ref(db, 'users/teacher123uid'), null);
      }
    }

    // Setup admin account
    const adminEmail = 'admin@attendancemarkin.com';
    const adminPassword = 'admin123';
    
    let adminUid;
    try {
      // Try to create new admin account
      const adminCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      adminUid = adminCred.user.uid;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // If admin exists, sign in to get the UID
        const adminCred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        adminUid = adminCred.user.uid;
      } else {
        throw error;
      }
    }

    // Set admin role with actual UID
    if (adminUid) {
      await set(ref(db, `users/${adminUid}`), {
        email: adminEmail,
        role: 'admin',
        createdAt: Date.now()
      });
    }

    // Setup teacher account
    const teacherEmail = 'teacher@attendancemarkin.com';
    const teacherPassword = 'teacher123';
    
    let teacherUid;
    try {
      // Try to create new teacher account
      const teacherCred = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
      teacherUid = teacherCred.user.uid;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // If teacher exists, sign in to get the UID
        const teacherCred = await signInWithEmailAndPassword(auth, teacherEmail, teacherPassword);
        teacherUid = teacherCred.user.uid;
      } else {
        throw error;
      }
    }

    // Set teacher role with actual UID
    if (teacherUid) {
      await set(ref(db, `users/${teacherUid}`), {
        email: teacherEmail,
        role: 'teacher',
        createdAt: Date.now()
      });
    }

    console.log('Initial accounts setup completed successfully');
    console.log('Admin UID:', adminUid);
    console.log('Teacher UID:', teacherUid);

    return true;
  } catch (error) {
    console.error('Error setting up initial accounts:', error);
    return false;
  }
};

export const addSampleStudents = async () => {
  try {
    const sampleStudents = [
      {
        name: "John Smith",
        registrationNumber: "2024001",
        class: "A",
        grade: "Grade 1",
      },
      {
        name: "Emma Wilson",
        registrationNumber: "2024002",
        class: "A",
        grade: "Grade 1",
      },
      {
        name: "Michael Brown",
        registrationNumber: "2024003",
        class: "B",
        grade: "Grade 1",
      },
      {
        name: "Sarah Davis",
        registrationNumber: "2024004",
        class: "B",
        grade: "Grade 1",
      },
      {
        name: "James Johnson",
        registrationNumber: "2024005",
        class: "A",
        grade: "Grade 2",
      },
      {
        name: "Emily Taylor",
        registrationNumber: "2024006",
        class: "A",
        grade: "Grade 2",
      },
      {
        name: "William Anderson",
        registrationNumber: "2024007",
        class: "B",
        grade: "Grade 2",
      },
      {
        name: "Olivia Martin",
        registrationNumber: "2024008",
        class: "B",
        grade: "Grade 2",
      },
      {
        name: "Alexander White",
        registrationNumber: "2024009",
        class: "A",
        grade: "Grade 3",
      },
      {
        name: "Sophia Thomas",
        registrationNumber: "2024010",
        class: "A",
        grade: "Grade 3",
      }
    ];

    for (const studentData of sampleStudents) {
      await addStudent(studentData);
    }

    console.log('Sample students added successfully');
    return true;
  } catch (error) {
    console.error('Error adding sample students:', error);
    return false;
  }
};

export const updateAttendanceStatus = async (
  date: string,
  classId: string,
  studentId: string,
  updates: Partial<{
    present: boolean;
    isLateArrival: boolean;
    leftEarly: boolean;
    note: string;
    isExcused: boolean;
    absenceReason: string;
  }>
): Promise<void> => {
  const attendanceRef = ref(database, `attendance/${date}/${classId}/records/${studentId}`);
  const timestamp = Date.now();

  const snapshot = await get(attendanceRef);
  if (!snapshot.exists()) {
    throw new Error('Attendance record not found');
  }

  const currentRecord = snapshot.val();
  await set(attendanceRef, {
    ...currentRecord,
    ...updates,
    timestamp,
    markedBy: auth.currentUser?.email || 'unknown',
    markedTime: new Date().toLocaleTimeString()
  });
};

export const getAttendanceStats = async (
  startDate: string,
  endDate: string,
  grade?: string,
  classId?: string
) => {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to view statistics');
    }

    // First check user role
    const userRole = await getUserRole(auth.currentUser.uid);
    if (!userRole || (userRole !== 'admin' && userRole !== 'teacher')) {
      throw new Error('You do not have permission to view statistics');
    }

    // Try to get cached stats first
    const cacheKey = `stats_${startDate}_${endDate}_${grade || 'all'}_${classId || 'all'}`;
    const cachedStats = await get(ref(database, `stats/cached/${cacheKey}`));
    if (cachedStats.exists()) {
      const cached = cachedStats.val();
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
        return cached.data;
      }
    }

    const attendanceRef = ref(database, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (!snapshot.exists()) {
      const emptyStats = {
        totalDays: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalExcused: 0,
        averageAttendance: 0,
        byDate: {},
        generatedAt: Date.now(),
        generatedBy: auth.currentUser.email
      };
      
      // Cache empty stats
      await set(ref(database, `stats/cached/${cacheKey}`), {
        data: emptyStats,
        timestamp: Date.now()
      });
      
      return emptyStats;
    }

    const stats = {
      totalDays: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalExcused: 0,
      averageAttendance: 0,
      byDate: {} as Record<string, {
        present: number;
        absent: number;
        late: number;
        excused: number;
      }>,
      generatedAt: Date.now(),
      generatedBy: auth.currentUser.email
    };

    const attendanceData = snapshot.val();
    Object.entries(attendanceData).forEach(([date, classes]: [string, any]) => {
      if (date >= startDate && date <= endDate) {
        Object.entries(classes).forEach(([cls, data]: [string, any]) => {
          if ((!grade || data.grade === grade) && (!classId || cls === classId)) {
            stats.totalDays++;
            stats.totalPresent += data.totalPresent || 0;
            stats.totalAbsent += data.totalAbsent || 0;
            stats.totalLate += data.totalLate || 0;
            stats.totalExcused += data.totalExcused || 0;

            stats.byDate[date] = {
              present: (stats.byDate[date]?.present || 0) + (data.totalPresent || 0),
              absent: (stats.byDate[date]?.absent || 0) + (data.totalAbsent || 0),
              late: (stats.byDate[date]?.late || 0) + (data.totalLate || 0),
              excused: (stats.byDate[date]?.excused || 0) + (data.totalExcused || 0)
            };
          }
        });
      }
    });

    const totalStudents = stats.totalPresent + stats.totalAbsent;
    stats.averageAttendance = totalStudents > 0 
      ? Math.round((stats.totalPresent / totalStudents) * 100) 
      : 0;

    // Cache the stats
    await set(ref(database, `stats/cached/${cacheKey}`), {
      data: stats,
      timestamp: Date.now()
    });

    return stats;
  } catch (error: any) {
    throw handleError(error, 'Error fetching attendance statistics:');
  }
};

export const updateAttendanceRecord = async (
  date: string,
  classId: string,
  records: AttendanceStatus[],
  metadata: {
    grade: string;
    period?: string;
    academicYear?: string;
    section?: string;
    schoolDayType?: string;
  }
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to mark attendance');
    }

    // Check user role first
    const userRole = await getUserRole(auth.currentUser.uid);
    if (!userRole || (userRole !== 'admin' && userRole !== 'teacher')) {
      throw new Error('You do not have permission to mark attendance. Only teachers and admins can mark attendance.');
    }

    const attendanceRef = ref(database, `attendance/${date}/${classId}`);
    const timestamp = Date.now();
    
    // Get existing record first
    const snapshot = await get(attendanceRef);
    const existingData = snapshot.exists() ? snapshot.val() : {
      id: `${date}_${classId}`,
      date: date,
      class: classId,
      grade: metadata.grade,
      academicYear: metadata.academicYear || new Date(date).getFullYear().toString(),
      period: metadata.period || 'Morning',
      section: metadata.section || 'Primary',
      schoolDayType: metadata.schoolDayType || 'Regular',
      lastModified: timestamp
    };
    
    // Format records with simplified attendance details
    const formattedRecords = records.reduce((acc, record) => {
      acc[record.studentId] = {
        present: record.present,
        timestamp,
        markedBy: auth.currentUser?.email || 'unknown',
        markedTime: new Date().toLocaleTimeString(),
        note: record.note || '',
        lastModifiedBy: auth.currentUser?.email || 'unknown',
        lastModifiedAt: timestamp
      };
      return acc;
    }, {} as Record<string, any>);

    // Calculate totals
    const totalPresent = Object.values(formattedRecords).filter(r => r.present).length;
    const totalAbsent = Object.values(formattedRecords).filter(r => !r.present).length;

    // Update the record with new data while preserving metadata
    await set(attendanceRef, {
      ...existingData,
      records: formattedRecords,
      lastModified: timestamp,
      lastModifiedBy: auth.currentUser?.email || 'unknown',
      totalPresent,
      totalAbsent,
      submitted: true,
      submittedBy: auth.currentUser?.email || 'unknown'
    });

    console.log('Attendance updated successfully:', {
      date,
      classId,
      totalPresent,
      totalAbsent,
      updatedBy: auth.currentUser?.email
    });
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    throw handleError(error, 'Failed to update attendance:');
  }
};

// Cache storage
const statsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to get cache key
function getCacheKey(type: string, ...params: any[]): string {
  return `${type}:${params.join(':')}`;
}

// Helper function to check if cache is valid
function isCacheValid(cacheEntry: { timestamp: number }): boolean {
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
}

// Get daily stats with caching
export async function getCachedDailyStats(date: string) {
  const cacheKey = getCacheKey('daily', date);
  const cached = statsCache.get(cacheKey);

  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  const stats = await getDailyStats(date);
  statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
  return stats;
}

// Get monthly stats with caching
export async function getCachedMonthlyStats(year: number, month: number) {
  const cacheKey = getCacheKey('monthly', year, month);
  const cached = statsCache.get(cacheKey);

  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  const stats = await getMonthlyStats(year, month);
  statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
  return stats;
}

// Get daily attendance statistics
async function getDailyStats(date: string) {
  try {
    const db = getDatabase();
    const attendanceRef = ref(db, 'attendance');
    const studentsRef = ref(db, 'students');

    // Get total number of students
    const studentsSnapshot = await get(studentsRef);
    const totalStudents = studentsSnapshot.exists() ? Object.keys(studentsSnapshot.val()).length : 0;

    // Get attendance for the specific date
    const dateQuery = query(attendanceRef, orderByChild('date'), startAt(date), endAt(date));
    const attendanceSnapshot = await get(dateQuery);

    let presentCount = 0;
    let totalCount = 0;

    if (attendanceSnapshot.exists()) {
      const records = attendanceSnapshot.val();
      Object.values(records).forEach((record: any) => {
        if (record.records) {
          Object.values(record.records).forEach((studentRecord: any) => {
            totalCount++;
            if (studentRecord.present) {
              presentCount++;
            }
          });
        }
      });
    }

    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return {
      totalStudents,
      presentCount,
      totalCount,
      attendanceRate
    };
  } catch (error) {
    console.error('Error getting daily stats:', error);
    throw error;
  }
}

// Get monthly attendance statistics
async function getMonthlyStats(year: number, month: number) {
  try {
    const db = getDatabase();
    const attendanceRef = ref(db, 'attendance');

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // Query attendance records for the month
    const monthQuery = query(attendanceRef, orderByChild('date'), startAt(startDate), endAt(endDate));
    const attendanceSnapshot = await get(monthQuery);

    let totalPresent = 0;
    let totalRecords = 0;
    let daysWithRecords = 0;

    if (attendanceSnapshot.exists()) {
      const records = attendanceSnapshot.val();
      Object.values(records).forEach((record: any) => {
        if (record.date >= startDate && record.date <= endDate && record.records) {
          daysWithRecords++;
          Object.values(record.records).forEach((studentRecord: any) => {
            totalRecords++;
            if (studentRecord.present) {
              totalPresent++;
            }
          });
        }
      });
    }

    const averageAttendance = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    return {
      daysWithRecords,
      totalPresent,
      totalRecords,
      averageAttendance
    };
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    throw error;
  }
} 