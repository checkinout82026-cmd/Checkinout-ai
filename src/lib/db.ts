import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch
} from 'firebase/firestore';
import { firestore } from './firebase';
import { User, Student, AttendanceRecord, AuthorizedPickupPerson } from '../types';
import { TEN_STUDENTS, INITIAL_ATTENDANCE_RECORDS, generate10Students } from './seedData';

const USERS_KEY = 'checkin_users';
const STUDENTS_KEY = 'checkin_students';
const ATTENDANCE_KEY = 'checkin_attendance';

export const defaultUsers: User[] = [
  { 
    id: 'admin_smith', 
    username: 'smith.admin', 
    role: 'admin', 
    name: 'Smith Admin', 
    fullName: 'Smith Admin', 
    email: 'smith.admin@school.com', 
    phone: '555-0100', 
    isActive: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
  {
    id: 'staff_adams',
    username: 'adams.staff',
    role: 'staff',
    name: 'Adams Staff',
    fullName: 'Adams Staff',
    email: 'adams.staff@school.com',
    phone: '555-0102',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const defaultStudents: Student[] = TEN_STUDENTS;
export const defaultAttendance: AttendanceRecord[] = INITIAL_ATTENDANCE_RECORDS;

// In-memory cache synced with Firestore and local fallback
let cachedUsers: User[] = defaultUsers;
let cachedStudents: Student[] = defaultStudents;
let cachedAttendance: AttendanceRecord[] = defaultAttendance;
let initialized = false;

export const db = {
  // Sync methods (reads from cache, writes to cache + Firestore)
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          cachedUsers = parsed.map(({ password, ...rest }: any) => rest as User);
        }
      } catch (e) {
        console.error('Error parsing cached users', e);
      }
    }
    return cachedUsers;
  },

  saveUsers: async (users: User[]) => {
    // Strip any sensitive fields before caching or persisting
    const sanitizedUsers = users.map(({ password, ...rest }: any) => rest as User);
    cachedUsers = sanitizedUsers;
    localStorage.setItem(USERS_KEY, JSON.stringify(sanitizedUsers));
    try {
      const batch = writeBatch(firestore);
      sanitizedUsers.forEach(u => {
        const ref = doc(firestore, 'users', u.id);
        batch.set(ref, {
          id: u.id,
          username: u.username,
          name: u.name || u.fullName || '',
          fullName: u.fullName || u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          role: u.role,
          isActive: u.isActive !== undefined ? u.isActive : true,
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore saveUsers error (using local state):', err);
    }
  },

  loadUsersFromFirestore: async (): Promise<User[]> => {
    try {
      const usersSnap = await getDocs(collection(firestore, 'users'));
      const list: User[] = [];
      usersSnap.forEach(docSnap => {
        const data = docSnap.data() as any;
        const { password, ...sanitized } = data;
        list.push({ ...sanitized, id: sanitized.id || docSnap.id });
      });

      const nextUsers = list.length > 0 ? list : defaultUsers;
      cachedUsers = nextUsers;
      localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      return nextUsers;
    } catch (err) {
      console.warn('Firestore loadUsers error (using local users):', err);
      return db.getUsers();
    }
  },

  saveUser: async (user: User) => {
    const { password, ...sanitizedUser } = user as any;
    const current = db.getUsers();
    const index = current.findIndex(u => u.id === sanitizedUser.id);
    let updated: User[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = sanitizedUser;
    } else {
      updated = [...current, sanitizedUser];
    }
    cachedUsers = updated;
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));

    try {
      const ref = doc(firestore, 'users', sanitizedUser.id);
      await setDoc(ref, {
        id: sanitizedUser.id,
        username: sanitizedUser.username,
        name: sanitizedUser.name || sanitizedUser.fullName || '',
        fullName: sanitizedUser.fullName || sanitizedUser.name || '',
        email: sanitizedUser.email || '',
        phone: sanitizedUser.phone || '',
        role: sanitizedUser.role,
        isActive: sanitizedUser.isActive !== undefined ? sanitizedUser.isActive : true,
        createdAt: sanitizedUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveUser error:', err);
    }
  },

  deleteUser: async (id: string) => {
    const current = db.getUsers().filter(u => u.id !== id);
    cachedUsers = current;
    localStorage.setItem(USERS_KEY, JSON.stringify(current));
    try {
      await deleteDoc(doc(firestore, 'users', id));
    } catch (err) {
      console.warn('Firestore deleteUser error:', err);
    }
  },

  loadStudentsFromFirestore: async (): Promise<Student[]> => {
    try {
      const studentsSnap = await getDocs(collection(firestore, 'students'));
      if (!studentsSnap.empty) {
        const list: Student[] = [];
        studentsSnap.forEach(docSnap => {
          const data = docSnap.data();
          const pPhone = data.parentPhone || data.parent?.phone || '';
          const pPhone2 = data.parentPhone2 || data.parent?.phone2 || '';
          list.push({
            id: data.id || docSnap.id,
            name: data.name || data.fullName || '',
            fullName: data.fullName || data.name || '',
            gradeLevel: data.gradeLevel || '',
            parent: data.parent || { 
              name: data.parentName || '', 
              phone: pPhone, 
              phone2: pPhone2,
              email: data.parentEmail || '' 
            },
            parentName: data.parentName || data.parent?.name || '',
            parentPhone: pPhone,
            parentPhone2: pPhone2,
            parentEmail: data.parentEmail || data.parent?.email || '',
            authorizedPickups: data.authorizedPickups || [],
            authorizedPickupDetails: data.authorizedPickupDetails || [],
            notes: data.notes || '',
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        cachedStudents = list;
        localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
        return list;
      }
      return db.getStudents();
    } catch (err) {
      console.warn('Firestore loadStudents error:', err);
      return db.getStudents();
    }
  },

  getStudents: (): Student[] => {
    const data = localStorage.getItem(STUDENTS_KEY);
    if (data) {
      try {
        cachedStudents = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing cached students', e);
      }
    }
    return cachedStudents;
  },

  saveStudents: async (students: Student[]) => {
    cachedStudents = students;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    try {
      // Chunk batches in sets of 200 for Firestore safety
      const chunkSize = 200;
      for (let i = 0; i < students.length; i += chunkSize) {
        const chunk = students.slice(i, i + chunkSize);
        const batch = writeBatch(firestore);
        chunk.forEach(s => {
          const ref = doc(firestore, 'students', s.id);
          const pPhone = s.parentPhone || s.parent?.phone || '';
          const pPhone2 = s.parentPhone2 || s.parent?.phone2 || '';
          batch.set(ref, {
            id: s.id,
            userId: s.userId || null,
            name: s.name || s.fullName || '',
            fullName: s.fullName || s.name || '',
            gradeLevel: s.gradeLevel || '',
            parentName: s.parentName || s.parent?.name || '',
            parentPhone: pPhone,
            parentPhone2: pPhone2,
            parentEmail: s.parentEmail || s.parent?.email || '',
            parent: {
              name: s.parent?.name || s.parentName || '',
              phone: pPhone,
              phone2: pPhone2,
              email: s.parent?.email || s.parentEmail || ''
            },
            authorizedPickups: s.authorizedPickups || [],
            authorizedPickupDetails: s.authorizedPickupDetails || [],
            notes: s.notes || '',
            isActive: s.isActive !== undefined ? s.isActive : true,
            createdAt: s.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore saveStudents error:', err);
    }
  },

  saveStudent: async (student: Student) => {
    const current = db.getStudents();
    const index = current.findIndex(s => s.id === student.id);
    let updated: Student[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = student;
    } else {
      updated = [...current, student];
    }
    cachedStudents = updated;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));

    try {
      const ref = doc(firestore, 'students', student.id);
      const pPhone = student.parentPhone || student.parent?.phone || '';
      const pPhone2 = student.parentPhone2 || student.parent?.phone2 || '';
      await setDoc(ref, {
        id: student.id,
        userId: student.userId || null,
        name: student.name || student.fullName || '',
        fullName: student.fullName || student.name || '',
        gradeLevel: student.gradeLevel || '',
        parentName: student.parentName || student.parent?.name || '',
        parentPhone: pPhone,
        parentPhone2: pPhone2,
        parentEmail: student.parentEmail || student.parent?.email || '',
        parent: {
          name: student.parent?.name || student.parentName || '',
          phone: pPhone,
          phone2: pPhone2,
          email: student.parent?.email || student.parentEmail || ''
        },
        authorizedPickups: student.authorizedPickups || [],
        authorizedPickupDetails: student.authorizedPickupDetails || [],
        notes: student.notes || '',
        isActive: student.isActive !== undefined ? student.isActive : true,
        createdAt: student.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveStudent error:', err);
    }
  },

  deleteStudent: async (id: string) => {
    const current = db.getStudents().filter(s => s.id !== id);
    cachedStudents = current;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(current));
    try {
      await deleteDoc(doc(firestore, 'students', id));
    } catch (err) {
      console.warn('Firestore deleteStudent error:', err);
    }
  },

  loadAttendanceFromFirestore: async (): Promise<AttendanceRecord[]> => {
    try {
      const snap = await getDocs(collection(firestore, 'attendance'));
      if (!snap.empty) {
        const list: AttendanceRecord[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as AttendanceRecord);
        });
        cachedAttendance = list;
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
        return list;
      } else {
        // If Firestore attendance is empty, seed initial attendance records
        await db.saveAttendance(defaultAttendance);
        return defaultAttendance;
      }
    } catch (err) {
      console.warn('Firestore loadAttendance error:', err);
      return db.getAttendance();
    }
  },

  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedAttendance = parsed;
        } else {
          cachedAttendance = defaultAttendance;
        }
      } catch (e) {
        console.error('Error parsing cached attendance', e);
      }
    } else {
      cachedAttendance = defaultAttendance;
    }
    return cachedAttendance;
  },

  importAttendanceRecords: async (newRecords: AttendanceRecord[]) => {
    const current = db.getAttendance();
    const existingMap = new Map(current.map(r => [r.id, r]));
    newRecords.forEach(nr => {
      existingMap.set(nr.id, nr);
    });
    const combined = Array.from(existingMap.values());
    await db.saveAttendance(combined);
    return combined;
  },

  seedInitialAttendance: async () => {
    await db.saveAttendance(defaultAttendance);
    return defaultAttendance;
  },

  saveAttendance: async (records: AttendanceRecord[]) => {
    cachedAttendance = records;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    try {
      const batch = writeBatch(firestore);
      records.forEach(r => {
        const ref = doc(firestore, 'attendance', r.id);
        batch.set(ref, {
          id: r.id,
          studentId: r.studentId,
          studentName: r.studentName || '',
          date: r.date,
          status: r.status || (r.checkOutTime ? 'checked_out' : 'checked_in'),
          checkInTime: r.checkInTime,
          checkInStaffId: r.checkInStaffId || null,
          checkInStaffName: r.checkInStaffName || null,
          checkInMethod: r.checkInMethod || 'kiosk',
          checkOutTime: r.checkOutTime || null,
          checkOutStaffId: r.checkOutStaffId || null,
          checkOutStaffName: r.checkOutStaffName || null,
          pickupPersonId: r.pickupPersonId || null,
          pickupPerson: r.pickupPerson || r.pickupPersonName || null,
          pickupPersonName: r.pickupPersonName || r.pickupPerson || null,
          smsNotificationSent: r.smsNotificationSent || false,
          smsSentAt: r.smsSentAt || null,
          notes: r.notes || '',
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore saveAttendance error:', err);
    }
  },

  saveAttendanceRecord: async (record: AttendanceRecord) => {
    const current = db.getAttendance();
    const index = current.findIndex(r => r.id === record.id);
    let updated: AttendanceRecord[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = record;
    } else {
      updated = [...current, record];
    }
    cachedAttendance = updated;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));

    try {
      const ref = doc(firestore, 'attendance', record.id);
      await setDoc(ref, {
        id: record.id,
        studentId: record.studentId,
        studentName: record.studentName || '',
        date: record.date,
        status: record.status || (record.checkOutTime ? 'checked_out' : 'checked_in'),
        checkInTime: record.checkInTime,
        checkInStaffId: record.checkInStaffId || null,
        checkInStaffName: record.checkInStaffName || null,
        checkInMethod: record.checkInMethod || 'kiosk',
        checkOutTime: record.checkOutTime || null,
        checkOutStaffId: record.checkOutStaffId || null,
        checkOutStaffName: record.checkOutStaffName || null,
        pickupPersonId: record.pickupPersonId || null,
        pickupPerson: record.pickupPerson || record.pickupPersonName || null,
        pickupPersonName: record.pickupPersonName || record.pickupPerson || null,
        smsNotificationSent: record.smsNotificationSent || false,
        smsSentAt: record.smsSentAt || null,
        notes: record.notes || '',
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAttendanceRecord error:', err);
    }
  },

  deleteAttendanceRecord: async (id: string) => {
    const current = db.getAttendance().filter(r => r.id !== id);
    cachedAttendance = current;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(current));
    try {
      await deleteDoc(doc(firestore, 'attendance', id));
    } catch (err) {
      console.warn('Firestore deleteAttendanceRecord error:', err);
    }
  },

  deleteAttendanceRecords: async (ids: string[]) => {
    if (!ids.length) return;
    const idSet = new Set(ids);
    const current = db.getAttendance().filter(r => !idSet.has(r.id));
    cachedAttendance = current;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(current));
    try {
      const batch = writeBatch(firestore);
      ids.forEach(id => {
        batch.delete(doc(firestore, 'attendance', id));
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore deleteAttendanceRecords error:', err);
    }
  },

  clearAllAttendance: async () => {
    cachedAttendance = [];
    localStorage.removeItem(ATTENDANCE_KEY);
    try {
      const snap = await getDocs(collection(firestore, 'attendance'));
      const batch = writeBatch(firestore);
      snap.forEach(d => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore clearAllAttendance error:', err);
    }
  },

  seed10Students: async () => {
    const list = generate10Students();
    await db.saveStudents(list);
    return list;
  },

  // Prune database and keep only the 10 standard students
  resetTo10Students: async () => {
    try {
      const studentsSnap = await getDocs(collection(firestore, 'students'));
      const validIds = new Set(TEN_STUDENTS.map(s => s.id));
      
      const batch = writeBatch(firestore);
      let excessCount = 0;
      studentsSnap.forEach(docSnap => {
        if (!validIds.has(docSnap.id)) {
          batch.delete(docSnap.ref);
          excessCount++;
        }
      });
      if (excessCount > 0) {
        await batch.commit();
      }

      await db.saveStudents(TEN_STUDENTS);
      cachedStudents = TEN_STUDENTS;
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(TEN_STUDENTS));
      return TEN_STUDENTS;
    } catch (e) {
      console.warn('resetTo10Students error:', e);
      cachedStudents = TEN_STUDENTS;
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(TEN_STUDENTS));
      return TEN_STUDENTS;
    }
  },

  // Listeners for real-time sync with Firebase
  subscribeUsers: (callback: (users: User[]) => void) => {
    try {
      const q = collection(firestore, 'users');
      return onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as User);
          });
          
          // Ensure KeshavKousik is always in database and list
          if (!list.some(u => u.username?.toLowerCase() === 'keshavkousik' || u.id === 'admin_keshav')) {
            const adminDoc = defaultUsers[0];
            list.unshift(adminDoc);
            setDoc(doc(firestore, 'users', 'admin_keshav'), adminDoc, { merge: true }).catch(() => {});
          }

          cachedUsers = list;
          localStorage.setItem(USERS_KEY, JSON.stringify(list));
          callback(list);
        } else {
          // Empty collection: write admin to Firestore
          const adminDoc = defaultUsers[0];
          setDoc(doc(firestore, 'users', 'admin_keshav'), adminDoc, { merge: true }).catch(() => {});
          callback(defaultUsers);
        }
      }, (err) => {
        console.warn('Users onSnapshot error:', err);
        callback(db.getUsers());
      });
    } catch (e) {
      console.warn('Users subscribe failed:', e);
      callback(db.getUsers());
      return () => {};
    }
  },

  subscribeStudents: (callback: (students: Student[]) => void) => {
    try {
      const q = collection(firestore, 'students');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Student[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const pPhone = data.parentPhone || data.parent?.phone || '';
            const pPhone2 = data.parentPhone2 || data.parent?.phone2 || '';
            list.push({
              id: data.id || docSnap.id,
              name: data.name || data.fullName || '',
              fullName: data.fullName || data.name || '',
              gradeLevel: data.gradeLevel || '',
              parent: data.parent || { 
                name: data.parentName || '', 
                phone: pPhone, 
                phone2: pPhone2,
                email: data.parentEmail || '' 
              },
              parentName: data.parentName || data.parent?.name || '',
              parentPhone: pPhone,
              parentPhone2: pPhone2,
              parentEmail: data.parentEmail || data.parent?.email || '',
              authorizedPickups: data.authorizedPickups || [],
              authorizedPickupDetails: data.authorizedPickupDetails || [],
              notes: data.notes || '',
              isActive: data.isActive !== undefined ? data.isActive : true,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });
          cachedStudents = list;
          localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
          callback(list);
        } else {
          callback(db.getStudents());
        }
      }, (err) => {
        console.warn('Students onSnapshot error:', err);
        callback(db.getStudents());
      });
    } catch (e) {
      console.warn('Students subscribe failed:', e);
      callback(db.getStudents());
      return () => {};
    }
  },

  subscribeAttendance: (callback: (records: AttendanceRecord[]) => void) => {
    try {
      const q = collection(firestore, 'attendance');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: AttendanceRecord[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as AttendanceRecord);
          });
          cachedAttendance = list;
          localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
          callback(list);
        } else {
          callback(db.getAttendance());
        }
      }, (err) => {
        console.warn('Attendance onSnapshot error:', err);
        callback(db.getAttendance());
      });
    } catch (e) {
      console.warn('Attendance subscribe failed:', e);
      callback(db.getAttendance());
      return () => {};
    }
  },

  // Seed DB in Firestore if empty or clean up excess students
  init: async () => {
    if (initialized) return;
    initialized = true;

    // Clean legacy test users from local storage if present
    const localUsersData = localStorage.getItem(USERS_KEY);
    if (!localUsersData) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      cachedUsers = defaultUsers;
    } else {
      try {
        const parsed: User[] = JSON.parse(localUsersData);
        const legacyIds = new Set(['u1', 'u2', 'u3', 'u4']);
        let filtered = parsed.filter(u => !legacyIds.has(u.id));
        
        // Upgrade smith.admin to KeshavKousik if present in cache
        const smithIdx = filtered.findIndex(u => u.id === 'admin_smith' || u.username === 'smith.admin');
        if (smithIdx >= 0) {
          filtered[smithIdx] = defaultUsers[0];
        } else if (!filtered.some(u => u.username?.toLowerCase() === 'keshavkousik' || u.id === 'admin_keshav')) {
          filtered.unshift(defaultUsers[0]);
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
        cachedUsers = filtered;
      } catch {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        cachedUsers = defaultUsers;
      }
    }
    
    // Students in local cache: initialize with actual students roster
    const localStudentsData = localStorage.getItem(STUDENTS_KEY);
    if (!localStudentsData) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
      cachedStudents = defaultStudents;
    } else {
      try {
        const parsed = JSON.parse(localStudentsData);
        // If parsed is dummy roster with <= 10 students, upgrade to the full actual students roster
        if (!Array.isArray(parsed) || parsed.length <= 10 || parsed.some(s => s.name === 'Liam Smith' || s.name === 'Noah Johnson')) {
          localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
          cachedStudents = defaultStudents;
        } else {
          cachedStudents = parsed;
        }
      } catch {
        localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
        cachedStudents = defaultStudents;
      }
    }

    if (!localStorage.getItem(ATTENDANCE_KEY)) {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(defaultAttendance));
      cachedAttendance = defaultAttendance;
    }

    // Check & seed Firestore collections
    try {
      await db.loadUsersFromFirestore();
      await db.loadStudentsFromFirestore();
      await db.loadAttendanceFromFirestore();
      const usersSnap = await getDocs(collection(firestore, 'users'));

      // Clean up legacy users (u1, u2, u3, u4) from Firestore
      const legacyIds = ['u1', 'u2', 'u3', 'u4'];
      for (const d of usersSnap.docs) {
        if (legacyIds.includes(d.id)) {
          try {
            await deleteDoc(doc(firestore, 'users', d.id));
          } catch (e) {
            console.warn('Legacy user delete notice:', e);
          }
        }
      }

      const studentsSnap = await getDocs(collection(firestore, 'students'));
      // Only seed initial synthetic students if the collection is completely empty
      if (studentsSnap.empty) {
        console.log('Seeding initial synthetic student roster to Firestore...');
        await db.saveStudents(defaultStudents);
      } else {
        await db.loadStudentsFromFirestore();
      }

      // Also seed authorized_pickups collection for relational representation
      const pickupsSnap = await getDocs(collection(firestore, 'authorized_pickups'));
      if (pickupsSnap.empty) {
        const batch = writeBatch(firestore);
        defaultStudents.forEach(s => {
          (s.authorizedPickupDetails || []).forEach(p => {
            const pId = crypto.randomUUID();
            const pRef = doc(firestore, 'authorized_pickups', pId);
            batch.set(pRef, {
              id: pId,
              studentId: s.id,
              name: p.name,
              relationship: p.relationship || 'Guardian',
              phone: p.phone || s.parent.phone,
              isPrimary: p.isPrimary || false,
              createdAt: new Date().toISOString()
            });
          });
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore initialization seed notice:', err);
    }
  }
};
