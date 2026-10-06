import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { firestore, isLocalOffline } from './firebase';
import { User, Student, AttendanceRecord, AuthorizedPickupPerson } from '../types';
import { 
  ALL_SEED_STUDENTS, 
  ALL_SEED_ATTENDANCE, 
  TEN_STUDENTS, 
  INITIAL_ATTENDANCE_RECORDS, 
  generate10Students 
} from './seedData';
import { getActiveSchoolId, getSchoolById, SEED_SCHOOLS } from './tenantContext';
import { getSeedStudentsForSchool, getSeedAttendanceForSchool } from './seedData';

export function getCollectionName(
  base: 'students' | 'attendance' | 'authorized_pickups', 
  schoolId: string = getActiveSchoolId()
): string {
  // Dublin East uses root collections for 100% backward compatibility with production master branch
  if (schoolId === 'school_dublin_east') {
    return base;
  }
  const school = getSchoolById(schoolId);
  const suffix = school ? school.slug.replace(/-/g, '_') : schoolId;
  return `${base}_${suffix}`;
}

const USERS_KEY = 'checkin_users';
const STUDENTS_KEY = 'checkin_students';
const ATTENDANCE_KEY = 'checkin_attendance';
const DELETED_USERS_KEY = 'checkin_deleted_users';

const localDbEmitter = new EventTarget();
function notifyLocalDbChange(event: 'users' | 'students' | 'attendance') {
  localDbEmitter.dispatchEvent(new Event(event));
}

export function getDeletedUsers(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const PRIMARY_SYSTEM_ACCOUNTS = [
  'ajita', 
  'sanjay', 
  'centerstaff', 
  'westadmin',
  'weststaff', 
  'pleasantonadmin',
  'pleasantonstaff',
  'sanramonadmin',
  'sanramonstaff',
  'superadmin', 
  'admin_ajita', 
  'admin_sanjay', 
  'admin_westadmin',
  'admin_pleasantonadmin',
  'admin_sanramonadmin',
  'admin_superadmin', 
  'staff_centerstaff', 
  'staff_weststaff',
  'staff_pleasantonstaff',
  'staff_sanramonstaff'
];

export function isUserDeleted(idOrUsername?: string): boolean {
  if (!idOrUsername) return false;
  const lower = idOrUsername.toLowerCase().trim();
  // Never block the required primary accounts
  if (PRIMARY_SYSTEM_ACCOUNTS.includes(lower)) return false;
  const deleted = getDeletedUsers();
  return deleted.some(d => d.toLowerCase().trim() === lower);
}

export function markUserDeleted(id: string, username?: string): void {
  try {
    const deleted = getDeletedUsers();
    const set = new Set(deleted.map(d => d.toLowerCase().trim()));
    if (id) set.add(id.toLowerCase().trim());
    if (username) set.add(username.toLowerCase().trim());
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Error saving deleted user tombstone:', e);
  }
}

export function deduplicateUsers(users: User[]): User[] {
  const map = new Map<string, User>();
  for (const u of users) {
    if (!u) continue;
    const key = (u.username || u.email || u.id || '').toLowerCase().trim();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, u);
    } else {
      // Favor genuine Firebase Auth UID over fallback prefixed ID
      const isExistingFallback = existing.id.startsWith('admin_') || existing.id.startsWith('staff_');
      const isCurrentFallback = u.id.startsWith('admin_') || u.id.startsWith('staff_');

      if (isExistingFallback && !isCurrentFallback) {
        map.set(key, { ...u, schoolId: u.schoolId || existing.schoolId });
      } else if (!isExistingFallback && isCurrentFallback) {
        if (!existing.schoolId && u.schoolId) {
          existing.schoolId = u.schoolId;
        }
      } else {
        if (!existing.schoolId && u.schoolId) {
          map.set(key, u);
        }
      }
    }
  }
  return Array.from(map.values());
}

export function deduplicateStudents(students: Student[]): Student[] {
  if (!Array.isArray(students)) return [];
  const map = new Map<string, Student>();
  
  for (const s of students) {
    if (!s) continue;
    // Primary key: Student ID (normalized)
    const rawId = s.id ? String(s.id).trim().toLowerCase() : '';
    // Secondary key fallback: normalized name + school
    const rawName = (s.name || s.fullName || '').trim().toLowerCase();
    const school = (s.schoolId || '').trim().toLowerCase();
    const key = rawId ? `id:${rawId}` : (rawName ? `name:${school}:${rawName}` : '');
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, s);
    } else {
      // Prefer record with richer data
      const existingDetailsCount = (existing.authorizedPickupDetails?.length || 0) + (existing.authorizedPickups?.length || 0);
      const incomingDetailsCount = (s.authorizedPickupDetails?.length || 0) + (s.authorizedPickups?.length || 0);
      const isIncomingRicher = incomingDetailsCount > existingDetailsCount || 
        (!!s.notes && !existing.notes) ||
        (!!s.parentPhone && !existing.parentPhone);

      if (isIncomingRicher) {
        map.set(key, { ...existing, ...s });
      }
    }
  }

  // Secondary deduplication pass by (school, name) to consolidate duplicate roster imports
  const nameMap = new Map<string, Student>();
  for (const s of map.values()) {
    const rawName = (s.name || s.fullName || '').trim().toLowerCase();
    const school = (s.schoolId || '').trim().toLowerCase();
    if (rawName && school) {
      const nameKey = `${school}:${rawName}`;
      const existing = nameMap.get(nameKey);
      if (!existing) {
        nameMap.set(nameKey, s);
      } else {
        const existingDetailsCount = (existing.authorizedPickupDetails?.length || 0) + (existing.authorizedPickups?.length || 0);
        const incomingDetailsCount = (s.authorizedPickupDetails?.length || 0) + (s.authorizedPickups?.length || 0);
        if (incomingDetailsCount > existingDetailsCount || (s.id && !existing.id)) {
          nameMap.set(nameKey, { ...existing, ...s });
        }
      }
    } else {
      nameMap.set(`id:${s.id}`, s);
    }
  }

  return Array.from(nameMap.values());
}

export const defaultUsers: User[] = [
  { 
    id: 'admin_ajita', 
    username: 'Ajita', 
    role: 'admin', 
    name: 'Ajita', 
    fullName: 'Ajita (Dublin - East Admin)', 
    email: 'ajita@school.org', 
    phone: '', 
    schoolId: 'school_dublin_east',
    isActive: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 'admin_sanjay', 
    username: 'Sanjay', 
    role: 'admin', 
    name: 'Sanjay', 
    fullName: 'Sanjay', 
    email: 'sanjay@school.org', 
    phone: '', 
    schoolId: 'school_dublin_east',
    isActive: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
  {
    id: 'admin_westadmin',
    username: 'WestAdmin',
    role: 'admin',
    name: 'WestAdmin',
    fullName: 'Center Admin (Dublin - West)',
    email: 'westadmin@school.org',
    phone: '',
    schoolId: 'school_dublin_west',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff_centerstaff',
    username: 'CenterStaff',
    role: 'staff',
    name: 'CenterStaff',
    fullName: 'Center Staff (Dublin - East)',
    email: 'centerstaff@school.org',
    phone: '',
    schoolId: 'school_dublin_east',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff_weststaff',
    username: 'WestStaff',
    role: 'staff',
    name: 'WestStaff',
    fullName: 'Center Staff (Dublin - West)',
    email: 'weststaff@school.org',
    phone: '',
    schoolId: 'school_dublin_west',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'admin_pleasantonadmin',
    username: 'PleasantonAdmin',
    role: 'admin',
    name: 'PleasantonAdmin',
    fullName: 'Pleasanton Admin',
    email: 'pleasantonadmin@school.org',
    phone: '',
    schoolId: 'school_pleasanton',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff_pleasantonstaff',
    username: 'PleasantonStaff',
    role: 'staff',
    name: 'PleasantonStaff',
    fullName: 'Center Staff (Pleasanton)',
    email: 'pleasantonstaff@school.org',
    phone: '',
    schoolId: 'school_pleasanton',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'admin_sanramonadmin',
    username: 'SanRamonAdmin',
    role: 'admin',
    name: 'SanRamonAdmin',
    fullName: 'San Ramon Admin',
    email: 'sanramonadmin@school.org',
    phone: '',
    schoolId: 'school_san_ramon',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff_sanramonstaff',
    username: 'SanRamonStaff',
    role: 'staff',
    name: 'SanRamonStaff',
    fullName: 'Center Staff (San Ramon)',
    email: 'sanramonstaff@school.org',
    phone: '',
    schoolId: 'school_san_ramon',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'admin_superadmin',
    username: 'SuperAdmin',
    role: 'super_admin',
    name: 'SuperAdmin',
    fullName: 'Central Multi-School Administrator',
    email: 'superadmin@school.org',
    phone: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const defaultStudents: Student[] = ALL_SEED_STUDENTS;
export const defaultAttendance: AttendanceRecord[] = ALL_SEED_ATTENDANCE;

// In-memory cache synced with Firestore and local fallback
let cachedUsers: User[] = defaultUsers;
let cachedStudents: Student[] = defaultStudents;
let cachedAttendance: AttendanceRecord[] = defaultAttendance;
let initialized = false;

export const db = {
  // Sync methods (reads from cache, writes to cache + Firestore)
  getUsers: (schoolId?: string): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const loaded = parsed.map(({ password, ...rest }: any) => rest as User);
          const combined = [...defaultUsers, ...loaded];
          cachedUsers = deduplicateUsers(combined).filter(u => !isUserDeleted(u.id) && !isUserDeleted(u.username));
        } else {
          cachedUsers = deduplicateUsers(defaultUsers).filter(u => !isUserDeleted(u.id) && !isUserDeleted(u.username));
        }
      } catch (e) {
        console.error('Error parsing cached users', e);
        cachedUsers = deduplicateUsers(defaultUsers).filter(u => !isUserDeleted(u.id) && !isUserDeleted(u.username));
      }
    } else {
      cachedUsers = deduplicateUsers(defaultUsers).filter(u => !isUserDeleted(u.id) && !isUserDeleted(u.username));
    }
    if (!schoolId || schoolId === 'all') return cachedUsers;
    return cachedUsers.filter(u => {
      if (schoolId === 'school_dublin_east') {
        return (u.schoolId === 'school_dublin_east' || !u.schoolId) && u.role !== 'super_admin';
      }
      return u.schoolId === schoolId;
    });
  },

  saveUsers: async (users: User[], schoolId?: string) => {
    // Strip any sensitive fields before caching or persisting
    const targetSchoolId = schoolId || getActiveSchoolId();
    const sanitizedUsers = users.map(({ password, ...rest }: any) => {
      const u = rest as User;
      return {
        ...u,
        schoolId: u.schoolId || (u.role === 'super_admin' ? undefined : targetSchoolId)
      };
    });
    cachedUsers = sanitizedUsers;
    localStorage.setItem(USERS_KEY, JSON.stringify(sanitizedUsers));
    notifyLocalDbChange('users');
    if (isLocalOffline) return;

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
          schoolId: u.schoolId || null,
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

  loadUsersFromFirestore: async (schoolId?: string): Promise<User[]> => {
    if (isLocalOffline) {
      return db.getUsers(schoolId);
    }

    try {
      const usersSnap = await getDocs(collection(firestore, 'users'));
      const list: User[] = [];
      usersSnap.forEach(docSnap => {
        const data = docSnap.data() as any;
        const { password, ...sanitized } = data;
        const u = { ...sanitized, id: sanitized.id || docSnap.id } as User;
        if (!isUserDeleted(u.id) && !isUserDeleted(u.username)) {
          list.push(u);
        }
      });

      const nextUsers = deduplicateUsers(list.length > 0 ? list : defaultUsers)
        .filter(u => !isUserDeleted(u.id) && !isUserDeleted(u.username));
      cachedUsers = nextUsers;
      localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      if (!schoolId || schoolId === 'all') return nextUsers;
      return nextUsers.filter(u => {
        if (schoolId === 'school_dublin_east') {
          return (u.schoolId === 'school_dublin_east' || !u.schoolId) && u.role !== 'super_admin';
        }
        return u.schoolId === schoolId;
      });
    } catch (err) {
      console.warn('Firestore loadUsers error (using local users):', err);
      return db.getUsers(schoolId);
    }
  },

  saveUser: async (user: User) => {
    const { password, ...sanitizedUser } = user as any;
    const targetSchoolId = sanitizedUser.schoolId || (sanitizedUser.role === 'super_admin' ? undefined : getActiveSchoolId());
    const finalUser: User = {
      ...sanitizedUser,
      schoolId: targetSchoolId
    };
    const current = db.getUsers();
    const index = current.findIndex(u => u.id === finalUser.id);
    let updated: User[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = finalUser;
    } else {
      updated = [...current, finalUser];
    }
    cachedUsers = updated;
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    notifyLocalDbChange('users');
    if (isLocalOffline) return;

    try {
      const ref = doc(firestore, 'users', finalUser.id);
      await setDoc(ref, {
        id: finalUser.id,
        username: finalUser.username,
        name: finalUser.name || finalUser.fullName || '',
        fullName: finalUser.fullName || finalUser.name || '',
        email: finalUser.email || '',
        phone: finalUser.phone || '',
        role: finalUser.role,
        schoolId: finalUser.schoolId || null,
        isActive: finalUser.isActive !== undefined ? finalUser.isActive : true,
        createdAt: finalUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveUser error:', err);
    }
  },

  deleteUser: async (id: string) => {
    const allUsers = db.getUsers();
    const target = allUsers.find(u => u.id === id);
    if (target && target.role === 'admin') {
      const targetSchoolId = target.schoolId || 'school_dublin_east';
      const activeAdmins = allUsers.filter(u => 
        u.role === 'admin' && 
        u.isActive !== false && 
        (u.schoolId === targetSchoolId || (!u.schoolId && targetSchoolId === 'school_dublin_east'))
      );
      if (activeAdmins.length <= 1) {
        throw new Error('Cannot delete the last remaining administrator account for this campus.');
      }
    }

    // Mark as deleted so automated initial seeding never resurrects it
    markUserDeleted(id, target?.username);

    const updated = allUsers.filter(u => u.id !== id);
    cachedUsers = updated;
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    notifyLocalDbChange('users');
    if (isLocalOffline) return;

    try {
      await deleteDoc(doc(firestore, 'users', id));
    } catch (err) {
      console.warn('Firestore deleteUser id doc error:', err);
    }

    if (target?.username) {
      try {
        const uLower = target.username.toLowerCase();
        await deleteDoc(doc(firestore, 'users', `admin_${uLower}`)).catch(() => {});
        await deleteDoc(doc(firestore, 'users', `staff_${uLower}`)).catch(() => {});
        const userQ = query(collection(firestore, 'users'), where('username', '==', target.username));
        const snap = await getDocs(userQ);
        for (const d of snap.docs) {
          await deleteDoc(d.ref).catch(() => {});
        }
      } catch (e) {
        console.warn('Firestore deleteUser username cleanup error:', e);
      }
    }
  },

  loadStudentsFromFirestore: async (schoolId?: string): Promise<Student[]> => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    if (isLocalOffline) {
      return db.getStudents(targetSchoolId);
    }

    try {
      const collectionName = getCollectionName('students', targetSchoolId);
      const q = collection(firestore, collectionName);
      const studentsSnap = await getDocs(q);
      if (!studentsSnap.empty) {
        const list: Student[] = [];
        studentsSnap.forEach(docSnap => {
          const data = docSnap.data();
          const pPhone = data.parentPhone || data.parent?.phone || '';
          const pPhone2 = data.parentPhone2 || data.parent?.phone2 || '';
          list.push({
            id: data.id || docSnap.id,
            schoolId: data.schoolId || targetSchoolId,
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
        const dedupedList = deduplicateStudents(list);
        const otherSchools = cachedStudents.filter(s => s.schoolId && s.schoolId !== targetSchoolId);
        cachedStudents = deduplicateStudents([...otherSchools, ...dedupedList]);
        localStorage.setItem(STUDENTS_KEY, JSON.stringify(cachedStudents));
        return dedupedList;
      }
      return db.getStudents(targetSchoolId);
    } catch (err: any) {
      console.warn('Firestore loadStudents error:', err);
      // Fallback: If regional collection is denied or fails, query root students collection
      if ((err?.code === 'permission-denied' || String(err).includes('permission')) && targetSchoolId !== 'school_dublin_east') {
        try {
          const rootQ = query(collection(firestore, 'students'), where('schoolId', '==', targetSchoolId));
          const rootSnap = await getDocs(rootQ);
          if (!rootSnap.empty) {
            const list: Student[] = [];
            rootSnap.forEach(docSnap => {
              const data = docSnap.data();
              const pPhone = data.parentPhone || data.parent?.phone || '';
              const pPhone2 = data.parentPhone2 || data.parent?.phone2 || '';
              list.push({
                id: data.id || docSnap.id,
                schoolId: data.schoolId || targetSchoolId,
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
            const dedupedList = deduplicateStudents(list);
            const otherSchools = cachedStudents.filter(s => s.schoolId && s.schoolId !== targetSchoolId);
            cachedStudents = deduplicateStudents([...otherSchools, ...dedupedList]);
            localStorage.setItem(STUDENTS_KEY, JSON.stringify(cachedStudents));
            return dedupedList;
          }
        } catch (rootErr) {
          console.warn('Root students fallback query notice:', rootErr);
        }
      }
      return db.getStudents(targetSchoolId);
    }
  },

  getStudents: (schoolId?: string): Student[] => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    const data = localStorage.getItem(STUDENTS_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          cachedStudents = deduplicateStudents(parsed);
        }
      } catch (e) {
        console.error('Error parsing cached students', e);
      }
    }
    const filtered = deduplicateStudents(cachedStudents.filter(s => s.schoolId === targetSchoolId));
    if (filtered.length > 0) return filtered;
    return deduplicateStudents(getSeedStudentsForSchool(targetSchoolId));
  },

  saveStudents: async (students: Student[], schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    const targetCollection = getCollectionName('students', targetSchoolId);
    const stampedStudents = students.map(s => ({
      ...s,
      schoolId: s.schoolId || targetSchoolId,
      authorizedPickupDetails: s.authorizedPickupDetails?.map(p => ({
        ...p,
        schoolId: p.schoolId || targetSchoolId
      }))
    }));
    const dedupedIncoming = deduplicateStudents(stampedStudents);
    const stampedIds = new Set(dedupedIncoming.map(s => s.id));
    const retained = cachedStudents.filter(s => !stampedIds.has(s.id));
    cachedStudents = deduplicateStudents([...retained, ...dedupedIncoming]);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(cachedStudents));
    notifyLocalDbChange('students');
    if (isLocalOffline) return;

    try {
      // Chunk batches in sets of 200 for Firestore safety
      const chunkSize = 200;
      for (let i = 0; i < dedupedIncoming.length; i += chunkSize) {
        const chunk = dedupedIncoming.slice(i, i + chunkSize);
        const batch = writeBatch(firestore);
        chunk.forEach(s => {
          const ref = doc(firestore, targetCollection, s.id);
          const pPhone = s.parentPhone || s.parent?.phone || '';
          const pPhone2 = s.parentPhone2 || s.parent?.phone2 || '';
          batch.set(ref, {
            id: s.id,
            userId: s.userId || null,
            schoolId: s.schoolId,
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
    } catch (err: any) {
      console.warn('Firestore saveStudents error:', err);
      if (err?.code === 'permission-denied' && targetSchoolId !== 'school_dublin_east') {
        try {
          const batch = writeBatch(firestore);
          dedupedIncoming.forEach(s => {
            const ref = doc(firestore, 'students', s.id);
            const pPhone = s.parentPhone || s.parent?.phone || '';
            const pPhone2 = s.parentPhone2 || s.parent?.phone2 || '';
            batch.set(ref, {
              id: s.id,
              userId: s.userId || null,
              schoolId: s.schoolId,
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
        } catch (e2) {
          console.warn('Fallback root saveStudents notice:', e2);
        }
      }
    }
  },

  saveStudent: async (student: Student) => {
    const targetSchoolId = student.schoolId || getActiveSchoolId();
    const finalStudent: Student = {
      ...student,
      schoolId: targetSchoolId,
      authorizedPickupDetails: student.authorizedPickupDetails?.map(p => ({
        ...p,
        schoolId: p.schoolId || targetSchoolId
      }))
    };
    const current = cachedStudents;
    const index = current.findIndex(s => s.id === finalStudent.id);
    let updated: Student[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = finalStudent;
    } else {
      updated = [...current, finalStudent];
    }
    cachedStudents = deduplicateStudents(updated);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(cachedStudents));
    notifyLocalDbChange('students');
    if (isLocalOffline) return;

    const pPhone = finalStudent.parentPhone || finalStudent.parent?.phone || '';
    const pPhone2 = finalStudent.parentPhone2 || finalStudent.parent?.phone2 || '';
    const payload = {
      id: finalStudent.id,
      userId: finalStudent.userId || null,
      schoolId: finalStudent.schoolId,
      name: finalStudent.name || finalStudent.fullName || '',
      fullName: finalStudent.fullName || finalStudent.name || '',
      gradeLevel: finalStudent.gradeLevel || '',
      parentName: finalStudent.parentName || finalStudent.parent?.name || '',
      parentPhone: pPhone,
      parentPhone2: pPhone2,
      parentEmail: finalStudent.parentEmail || finalStudent.parent?.email || '',
      parent: {
        name: finalStudent.parent?.name || finalStudent.parentName || '',
        phone: pPhone,
        phone2: pPhone2,
        email: finalStudent.parent?.email || finalStudent.parentEmail || ''
      },
      authorizedPickups: finalStudent.authorizedPickups || [],
      authorizedPickupDetails: finalStudent.authorizedPickupDetails || [],
      notes: finalStudent.notes || '',
      isActive: finalStudent.isActive !== undefined ? finalStudent.isActive : true,
      createdAt: finalStudent.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const targetCollection = getCollectionName('students', targetSchoolId);
      const ref = doc(firestore, targetCollection, finalStudent.id);
      await setDoc(ref, payload, { merge: true });
    } catch (err: any) {
      console.warn('Firestore saveStudent error:', err);
      if (err?.code === 'permission-denied' && targetSchoolId !== 'school_dublin_east') {
        try {
          const rootRef = doc(firestore, 'students', finalStudent.id);
          await setDoc(rootRef, payload, { merge: true });
        } catch (e2) {
          console.warn('Fallback root saveStudent notice:', e2);
        }
      }
    }
  },

  deleteStudent: async (id: string, schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    const current = db.getStudents(targetSchoolId).filter(s => s.id !== id);
    cachedStudents = cachedStudents.filter(s => s.id !== id);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(cachedStudents));
    notifyLocalDbChange('students');
    if (isLocalOffline) return;

    try {
      const targetCollection = getCollectionName('students', targetSchoolId);
      await deleteDoc(doc(firestore, targetCollection, id));
    } catch (err: any) {
      console.warn('Firestore deleteStudent error:', err);
      if (err?.code === 'permission-denied' && targetSchoolId !== 'school_dublin_east') {
        try {
          await deleteDoc(doc(firestore, 'students', id));
        } catch (e2) {
          console.warn('Fallback root deleteStudent notice:', e2);
        }
      }
    }
  },

  loadAttendanceFromFirestore: async (schoolId?: string): Promise<AttendanceRecord[]> => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    if (isLocalOffline) {
      return db.getAttendance(targetSchoolId);
    }

    try {
      const collectionName = getCollectionName('attendance', targetSchoolId);
      const q = collection(firestore, collectionName);
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: AttendanceRecord[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          list.push({
            ...data,
            id: docSnap.id,
            schoolId: data.schoolId || targetSchoolId
          } as AttendanceRecord);
        });
        const otherSchools = cachedAttendance.filter(a => a.schoolId && a.schoolId !== targetSchoolId);
        cachedAttendance = [...otherSchools, ...list];
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(cachedAttendance));
        return list;
      } else {
        return db.getAttendance(targetSchoolId);
      }
    } catch (err) {
      console.warn('Firestore loadAttendance error:', err);
      return db.getAttendance(targetSchoolId);
    }
  },

  getAttendance: (schoolId?: string): AttendanceRecord[] => {
    const targetSchoolId = schoolId || getActiveSchoolId();
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
    const filtered = cachedAttendance.filter(a => a.schoolId === targetSchoolId);
    if (filtered.length > 0) return filtered;
    return getSeedAttendanceForSchool(targetSchoolId);
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

  saveAttendance: async (records: AttendanceRecord[], schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    const targetCollection = getCollectionName('attendance', targetSchoolId);
    const stamped = records.map(r => ({
      ...r,
      schoolId: r.schoolId || targetSchoolId
    }));
    const stampedIds = new Set(stamped.map(r => r.id));
    const retained = cachedAttendance.filter(r => !stampedIds.has(r.id));
    cachedAttendance = [...retained, ...stamped];
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(cachedAttendance));
    notifyLocalDbChange('attendance');
    if (isLocalOffline) return;

    try {
      const batch = writeBatch(firestore);
      stamped.forEach(r => {
        const ref = doc(firestore, targetCollection, r.id);
        batch.set(ref, {
          id: r.id,
          studentId: r.studentId,
          schoolId: r.schoolId,
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
    const targetSchoolId = record.schoolId || getActiveSchoolId();
    const targetCollection = getCollectionName('attendance', targetSchoolId);
    const finalRecord: AttendanceRecord = {
      ...record,
      schoolId: targetSchoolId
    };
    const current = cachedAttendance;
    const index = current.findIndex(r => r.id === finalRecord.id);
    let updated: AttendanceRecord[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = finalRecord;
    } else {
      updated = [...current, finalRecord];
    }
    cachedAttendance = updated;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));
    notifyLocalDbChange('attendance');
    if (isLocalOffline) return;

    try {
      const ref = doc(firestore, targetCollection, finalRecord.id);
      await setDoc(ref, {
        id: finalRecord.id,
        studentId: finalRecord.studentId,
        schoolId: finalRecord.schoolId,
        studentName: finalRecord.studentName || '',
        date: finalRecord.date,
        status: finalRecord.status || (finalRecord.checkOutTime ? 'checked_out' : 'checked_in'),
        checkInTime: finalRecord.checkInTime,
        checkInStaffId: finalRecord.checkInStaffId || null,
        checkInStaffName: finalRecord.checkInStaffName || null,
        checkInMethod: finalRecord.checkInMethod || 'kiosk',
        checkOutTime: finalRecord.checkOutTime || null,
        checkOutStaffId: finalRecord.checkOutStaffId || null,
        checkOutStaffName: finalRecord.checkOutStaffName || null,
        pickupPersonId: finalRecord.pickupPersonId || null,
        pickupPerson: finalRecord.pickupPerson || finalRecord.pickupPersonName || null,
        pickupPersonName: finalRecord.pickupPersonName || finalRecord.pickupPerson || null,
        smsNotificationSent: finalRecord.smsNotificationSent || false,
        smsSentAt: finalRecord.smsSentAt || null,
        notes: finalRecord.notes || '',
        createdAt: finalRecord.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAttendanceRecord error:', err);
    }
  },

  deleteAttendanceRecord: async (id: string, schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    const targetCollection = getCollectionName('attendance', targetSchoolId);
    const current = db.getAttendance(targetSchoolId).filter(r => r.id !== id);
    cachedAttendance = cachedAttendance.filter(r => r.id !== id);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(cachedAttendance));
    notifyLocalDbChange('attendance');
    if (isLocalOffline) return;

    try {
      await deleteDoc(doc(firestore, targetCollection, id));
    } catch (err) {
      console.warn('Firestore deleteAttendanceRecord error:', err);
    }
  },

  deleteAttendanceRecords: async (ids: string[], schoolId?: string) => {
    if (!ids.length) return;
    const targetSchoolId = schoolId || getActiveSchoolId();
    const targetCollection = getCollectionName('attendance', targetSchoolId);
    const idSet = new Set(ids);
    const current = db.getAttendance(targetSchoolId).filter(r => !idSet.has(r.id));
    cachedAttendance = cachedAttendance.filter(r => !idSet.has(r.id));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(cachedAttendance));
    notifyLocalDbChange('attendance');
    if (isLocalOffline) return;
    try {
      const batch = writeBatch(firestore);
      ids.forEach(id => {
        batch.delete(doc(firestore, targetCollection, id));
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore deleteAttendanceRecords error:', err);
    }
  },

  clearAllAttendance: async (schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    const targetCollection = getCollectionName('attendance', targetSchoolId);
    cachedAttendance = cachedAttendance.filter(a => a.schoolId !== targetSchoolId);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(cachedAttendance));
    try {
      const q = collection(firestore, targetCollection);
      const snap = await getDocs(q);
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

  // Prune database and keep only the standard seed students
  resetTo10Students: async () => {
    try {
      const studentsSnap = await getDocs(collection(firestore, 'students'));
      const validIds = new Set(ALL_SEED_STUDENTS.map(s => s.id));
      
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

      await db.saveStudents(ALL_SEED_STUDENTS);
      cachedStudents = ALL_SEED_STUDENTS;
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(ALL_SEED_STUDENTS));
      return ALL_SEED_STUDENTS;
    } catch (e) {
      console.warn('resetTo10Students error:', e);
      cachedStudents = ALL_SEED_STUDENTS;
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(ALL_SEED_STUDENTS));
      return ALL_SEED_STUDENTS;
    }
  },

  // Listeners for real-time sync with Firebase
  subscribeUsers: (callback: (users: User[]) => void, schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    const filterFn = (list: User[]): User[] => {
      if (targetSchoolId === 'all') return list;
      return list.filter(u => {
        if (targetSchoolId === 'school_dublin_east') {
          return (u.schoolId === 'school_dublin_east' || !u.schoolId) && u.role !== 'super_admin';
        }
        return u.schoolId === targetSchoolId;
      });
    };

    if (isLocalOffline) {
      callback(filterFn(db.getUsers()));
      const handler = () => callback(filterFn(db.getUsers()));
      localDbEmitter.addEventListener('users', handler);
      return () => localDbEmitter.removeEventListener('users', handler);
    }

    try {
      const q = collection(firestore, 'users');
      return onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach(docSnap => {
            const u = docSnap.data() as User;
            const fullUser = { ...u, id: u.id || docSnap.id };
            if (!isUserDeleted(fullUser.id) && !isUserDeleted(fullUser.username)) {
              list.push(fullUser);
            }
          });

          const deduplicated = deduplicateUsers(list);
          cachedUsers = deduplicated;
          localStorage.setItem(USERS_KEY, JSON.stringify(deduplicated));
          callback(filterFn(deduplicated));
        } else {
          const activeDefaults = deduplicateUsers(defaultUsers).filter(u => !isUserDeleted(u.id) && !isUserDeleted(u.username));
          callback(filterFn(activeDefaults));
        }
      }, (err) => {
        console.warn('Users onSnapshot error:', err);
        callback(db.getUsers(targetSchoolId));
      });
    } catch (e) {
      console.warn('Users subscribe failed:', e);
      callback(db.getUsers(targetSchoolId));
      return () => {};
    }
  },

  subscribeStudents: (callback: (students: Student[]) => void, schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    if (isLocalOffline) {
      callback(deduplicateStudents(db.getStudents(targetSchoolId)));
      const handler = () => callback(deduplicateStudents(db.getStudents(targetSchoolId)));
      localDbEmitter.addEventListener('students', handler);
      return () => localDbEmitter.removeEventListener('students', handler);
    }

    try {
      const collectionName = getCollectionName('students', targetSchoolId);
      const q = collection(firestore, collectionName);
      let rootUnsub: (() => void) | null = null;

      const mainUnsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Student[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const pPhone = data.parentPhone || data.parent?.phone || '';
            const pPhone2 = data.parentPhone2 || data.parent?.phone2 || '';
            list.push({
              id: data.id || docSnap.id,
              schoolId: data.schoolId || targetSchoolId,
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
          const dedupedList = deduplicateStudents(list);
          const otherSchools = cachedStudents.filter(s => s.schoolId && s.schoolId !== targetSchoolId);
          cachedStudents = deduplicateStudents([...otherSchools, ...dedupedList]);
          localStorage.setItem(STUDENTS_KEY, JSON.stringify(cachedStudents));
          callback(dedupedList);
        } else {
          callback(deduplicateStudents(db.getStudents(targetSchoolId)));
        }
      }, (err) => {
        console.warn('Students onSnapshot error:', err);
        // Fallback: If regional collection is denied or fails, subscribe to root collection filtered by schoolId
        if (targetSchoolId !== 'school_dublin_east') {
          try {
            const rootQ = query(collection(firestore, 'students'), where('schoolId', '==', targetSchoolId));
            rootUnsub = onSnapshot(rootQ, (rootSnap) => {
              const list: Student[] = [];
              rootSnap.forEach(docSnap => {
                const data = docSnap.data();
                const pPhone = data.parentPhone || data.parent?.phone || '';
                const pPhone2 = data.parentPhone2 || data.parent?.phone2 || '';
                list.push({
                  id: data.id || docSnap.id,
                  schoolId: data.schoolId || targetSchoolId,
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
              const dedupedList = deduplicateStudents(list.length > 0 ? list : db.getStudents(targetSchoolId));
              const otherSchools = cachedStudents.filter(s => s.schoolId && s.schoolId !== targetSchoolId);
              cachedStudents = deduplicateStudents([...otherSchools, ...dedupedList]);
              localStorage.setItem(STUDENTS_KEY, JSON.stringify(cachedStudents));
              callback(dedupedList);
            }, () => {
              callback(deduplicateStudents(db.getStudents(targetSchoolId)));
            });
          } catch {
            callback(deduplicateStudents(db.getStudents(targetSchoolId)));
          }
        } else {
          callback(deduplicateStudents(db.getStudents(targetSchoolId)));
        }
      });

      return () => {
        mainUnsub();
        if (rootUnsub) rootUnsub();
      };
    } catch (e) {
      console.warn('Students subscribe failed:', e);
      callback(deduplicateStudents(db.getStudents(targetSchoolId)));
      return () => {};
    }
  },

  subscribeAttendance: (callback: (records: AttendanceRecord[]) => void, schoolId?: string) => {
    const targetSchoolId = schoolId || getActiveSchoolId();
    if (isLocalOffline) {
      callback(db.getAttendance(targetSchoolId));
      const handler = () => callback(db.getAttendance(targetSchoolId));
      localDbEmitter.addEventListener('attendance', handler);
      return () => localDbEmitter.removeEventListener('attendance', handler);
    }

    try {
      const collectionName = getCollectionName('attendance', targetSchoolId);
      const q = collection(firestore, collectionName);
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: AttendanceRecord[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            list.push({
              ...data,
              id: docSnap.id,
              schoolId: data.schoolId || targetSchoolId
            } as AttendanceRecord);
          });
          const otherSchools = cachedAttendance.filter(a => a.schoolId && a.schoolId !== targetSchoolId);
          cachedAttendance = [...otherSchools, ...list];
          localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(cachedAttendance));
          callback(list);
        } else {
          callback(db.getAttendance(targetSchoolId));
        }
      }, (err) => {
        console.warn('Attendance onSnapshot error:', err);
        callback(db.getAttendance(targetSchoolId));
      });
    } catch (e) {
      console.warn('Attendance subscribe failed:', e);
      callback(db.getAttendance(targetSchoolId));
      return () => {};
    }
  },

  // Seed DB in Firestore if empty or clean up excess students
  init: async () => {
    if (initialized) return;
    initialized = true;

    // Clean legacy test users from local storage if present
    const legacyIds = new Set(['u1', 'u2', 'u3', 'u4', 'admin_smith', 'staff_adams', 'admin_keshav']);
    const localUsersData = localStorage.getItem(USERS_KEY);
    if (!localUsersData) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      cachedUsers = defaultUsers;
    } else {
      try {
        const parsed: User[] = JSON.parse(localUsersData);
        let filtered = parsed.filter(u => !legacyIds.has(u.id) && !legacyIds.has(u.username?.toLowerCase()));
        
        defaultUsers.forEach(defUser => {
          if (!filtered.some(u => u.username?.toLowerCase() === defUser.username.toLowerCase())) {
            filtered.push(defUser);
          }
        });
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
        // If parsed is dummy roster with <= 10 students, upgrade to the full multi-school roster
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

    // Fast path: skip remote Firestore network calls and initial seeding in local dev mode
    if (isLocalOffline) {
      return;
    }

    // Check & seed Firestore collections
    try {
      await db.loadUsersFromFirestore();
      await db.loadStudentsFromFirestore();
      await db.loadAttendanceFromFirestore();
      const usersSnap = await getDocs(collection(firestore, 'users'));

      // Clean up legacy users from Firestore
      const legacyCleanup = ['u1', 'u2', 'u3', 'u4', 'admin_smith', 'staff_adams', 'admin_keshav'];
      for (const d of usersSnap.docs) {
        if (legacyCleanup.includes(d.id) || legacyCleanup.includes(d.data()?.username?.toLowerCase())) {
          try {
            await deleteDoc(doc(firestore, 'users', d.id));
          } catch (e) {
            console.warn('Legacy user delete notice:', e);
          }
        }
      }

      // Ensure configured accounts exist in Firestore if not deleted,
      // but DO NOT write duplicate fallback docs if user already exists under a Firebase Auth UID
      for (const defUser of defaultUsers) {
        if (!isUserDeleted(defUser.id) && !isUserDeleted(defUser.username)) {
          const alreadyExists = usersSnap.docs.some(d => {
            const data = d.data();
            return (
              d.id === defUser.id ||
              data.username?.toLowerCase() === defUser.username?.toLowerCase() ||
              data.email?.toLowerCase() === defUser.email?.toLowerCase()
            );
          });
          if (!alreadyExists) {
            try {
              await setDoc(doc(firestore, 'users', defUser.id), defUser, { merge: true });
            } catch (e) {
              console.warn('Default user set notice:', e);
            }
          }
        }
      }

      // Check & seed each school's dedicated students table if empty
      for (const school of SEED_SCHOOLS) {
        try {
          const collName = getCollectionName('students', school.id);
          const snap = await getDocs(collection(firestore, collName));
          if (snap.empty) {
            console.log(`Seeding initial students for ${school.name} (${collName})...`);
            const seedStudents = getSeedStudentsForSchool(school.id);
            await db.saveStudents(seedStudents, school.id);
          }
        } catch (e) {
          console.warn(`Notice checking/seeding school table for ${school.id}:`, e);
        }
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
              schoolId: s.schoolId || 'school_dublin_east',
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
