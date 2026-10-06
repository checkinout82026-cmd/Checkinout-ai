import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { User, Role } from '../types';
import { db, isUserDeleted, DUBLIN_EAST_ID } from './db';

export interface ConfiguredAccount {
  username: string;
  role: Role;
  name: string;
  fullName: string;
  password: string;
  email: string;
  schoolId?: string;
}

export const CONFIGURED_ACCOUNTS: ConfiguredAccount[] = [
  {
    username: 'Ajita',
    role: 'admin',
    name: 'Ajita',
    fullName: 'Ajita (Dublin - East Admin)',
    password: 'Oh43016',
    email: 'ajita@school.org',
    schoolId: 'school_dublin_east'
  },
  {
    username: 'Sanjay',
    role: 'admin',
    name: 'Sanjay',
    fullName: 'Sanjay',
    password: 'Oh43016',
    email: 'sanjay@school.org',
    schoolId: 'school_dublin_east'
  },
  {
    username: 'WestAdmin',
    role: 'admin',
    name: 'WestAdmin',
    fullName: 'Dublin - West Admin',
    password: 'Oh43016',
    email: 'westadmin@school.org',
    schoolId: 'school_dublin_west'
  },
  {
    username: 'WestStaff',
    role: 'staff',
    name: 'WestStaff',
    fullName: 'Center Staff (Dublin - West)',
    password: 'Oh43017',
    email: 'weststaff@school.org',
    schoolId: 'school_dublin_west'
  },
  {
    username: 'CenterStaff',
    role: 'staff',
    name: 'CenterStaff',
    fullName: 'Center Staff (Dublin - East)',
    password: 'Oh43017',
    email: 'centerstaff@school.org',
    schoolId: 'school_dublin_east'
  },
  {
    username: 'SuperAdmin',
    role: 'super_admin',
    name: 'SuperAdmin',
    fullName: 'Central Multi-School Administrator',
    password: 'Oh43016',
    email: 'superadmin@school.org'
  }
];

// Helper to convert Firebase User & Firestore Doc to app User
export async function getAppUserFromFirebase(firebaseUser: FirebaseUser): Promise<User> {
  const uid = firebaseUser.uid;
  const email = firebaseUser.email || '';
  const displayName = firebaseUser.displayName || email.split('@')[0] || 'Staff Member';

  try {
    const userDocRef = doc(firestore, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data() as User;
      return {
        ...data,
        id: uid,
        email: email || data.email,
        name: data.name || displayName,
        fullName: data.fullName || displayName,
        role: data.role || 'staff',
        username: data.username || email.split('@')[0] || uid.slice(0, 8),
      };
    }

    // Check if user exists by exact email matching in existing users
    const allUsers = await db.loadUsersFromFirestore();
    const existing = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    const role: Role = existing ? existing.role : 'staff';
    const newUser: User = {
      id: uid,
      username: existing?.username || email.split('@')[0] || `user_${uid.slice(0, 6)}`,
      name: existing?.name || displayName,
      fullName: existing?.fullName || displayName,
      email: email,
      phone: existing?.phone || '',
      role: role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(userDocRef, newUser, { merge: true });
    return newUser;
  } catch (error) {
    console.warn('Error fetching or creating user profile in Firestore:', error);
    return {
      id: uid,
      username: email.split('@')[0] || uid.slice(0, 8),
      name: displayName,
      fullName: displayName,
      email: email,
      role: 'staff',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

// Sign in with Username or Email via Firebase Auth
export async function signInWithEmail(usernameOrEmail: string, password: string): Promise<User> {
  const cleanInput = usernameOrEmail.trim();
  if (!cleanInput) {
    throw new Error('Please enter your username');
  }
  if (!password) {
    throw new Error('Please enter your password');
  }

  // Check against the configured accounts
  const configuredMatch = CONFIGURED_ACCOUNTS.find(
    acc => acc.username.toLowerCase() === cleanInput.toLowerCase() ||
           acc.email.toLowerCase() === cleanInput.toLowerCase()
  );

  // Load all users from Firestore / local storage to resolve email
  const allUsers = await db.loadUsersFromFirestore();

  // Look for a match by username (case-insensitive) or email
  const match = allUsers.find(u => 
    u.username?.toLowerCase() === cleanInput.toLowerCase() ||
    u.email?.toLowerCase() === cleanInput.toLowerCase() ||
    u.id?.toLowerCase() === cleanInput.toLowerCase()
  );

  const candidateSchoolId = match?.schoolId || configuredMatch?.schoolId;
  const candidateRole = match?.role || configuredMatch?.role;
  if (candidateSchoolId && candidateSchoolId !== 'school_dublin_east' && candidateRole !== 'super_admin') {
    throw new Error('This account belongs to Dublin - West and cannot sign into the Dublin - East portal.');
  }

  let emailToUse = cleanInput;
  if (!emailToUse.includes('@')) {
    if (match && match.email) {
      emailToUse = match.email;
    } else if (configuredMatch) {
      emailToUse = configuredMatch.email;
    } else {
      emailToUse = `${cleanInput.toLowerCase()}@school.org`;
    }
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
    const appUser = await getAppUserFromFirebase(userCredential.user);
    const resolvedUser: User = {
      ...appUser,
      username: match?.username || configuredMatch?.username || appUser.username,
      schoolId: match?.schoolId || configuredMatch?.schoolId || appUser.schoolId || 'school_dublin_east'
    };

    if (resolvedUser.schoolId && resolvedUser.schoolId !== 'school_dublin_east' && resolvedUser.role !== 'super_admin') {
      await signOut(auth).catch(() => {});
      throw new Error('This account belongs to Dublin - West and cannot sign into the Dublin - East portal.');
    }

    return resolvedUser;
  } catch (authError: any) {
    console.warn('Firebase Auth error:', authError?.code);

    // If account is one of our configured accounts and password matches:
    if (configuredMatch && configuredMatch.password === password) {
      if (configuredMatch.schoolId && configuredMatch.schoolId !== 'school_dublin_east' && configuredMatch.role !== 'super_admin') {
        throw new Error('This account belongs to Dublin - West and cannot sign into the Dublin - East portal.');
      }
      // Try to create the user in Firebase Auth so next time it logs in directly
      try {
        const createCred = await createUserWithEmailAndPassword(auth, emailToUse, password);
        await updateProfile(createCred.user, { displayName: configuredMatch.name });
        const appUser = await getAppUserFromFirebase(createCred.user);
        return {
          ...appUser,
          username: configuredMatch.username,
          role: configuredMatch.role,
          schoolId: configuredMatch.schoolId || 'school_dublin_east'
        };
      } catch (createErr: any) {
        console.warn('Firebase auto-create during login attempt notice:', createErr?.code);
      }

      // If Firebase Auth is offline or email/password is disabled in console, return authenticated user profile
      const localUser: User = {
        id: match?.id || `admin_${configuredMatch.username.toLowerCase()}`,
        username: configuredMatch.username,
        name: configuredMatch.name,
        fullName: configuredMatch.fullName,
        email: configuredMatch.email,
        phone: '',
        role: configuredMatch.role,
        schoolId: configuredMatch.schoolId || 'school_dublin_east',
        isActive: true,
        createdAt: match?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.saveUser(localUser);
      return localUser;
    }

    if (
      authError.code === 'auth/operation-not-allowed' ||
      authError?.message?.includes('PASSWORD_LOGIN_DISABLED')
    ) {
      throw new Error('Email/Password provider is disabled in Firebase Console. Please enable "Email/Password" under Authentication > Sign-in method.');
    }

    if (
      authError.code === 'auth/wrong-password' || 
      authError.code === 'auth/invalid-credential' ||
      authError.code === 'auth/user-not-found' ||
      authError.code === 'auth/invalid-email'
    ) {
      throw new Error('Invalid username or password');
    }

    throw new Error(authError?.message || 'Authentication failed');
  }
}

// Auto-provision configured default accounts in Firebase Auth and Firestore if possible
export async function autoProvisionConfiguredAccounts(): Promise<void> {
  for (const acc of CONFIGURED_ACCOUNTS) {
    // On main (Dublin East portal), never provision or mutate accounts for other campuses
    if (acc.schoolId && acc.schoolId !== DUBLIN_EAST_ID && acc.role !== 'super_admin') {
      continue;
    }
    if (isUserDeleted(acc.username) || isUserDeleted(acc.email)) {
      continue;
    }
    try {
      // Try to create in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
      await updateProfile(cred.user, { displayName: acc.name });
      const userDoc: User = {
        id: cred.user.uid,
        username: acc.username,
        name: acc.name,
        fullName: acc.fullName,
        email: acc.email,
        phone: '',
        role: acc.role,
        schoolId: acc.schoolId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(firestore, 'users', cred.user.uid), userDoc, { merge: true });
      await db.saveUser(userDoc);
    } catch (err: any) {
      // If user already exists in Firebase Auth or operation not allowed:
      // Ensure Firestore document exists with correct schoolId without creating duplicates
      try {
        const allUsers = await db.loadUsersFromFirestore();
        const existing = allUsers.find(u => 
          u.email?.toLowerCase() === acc.email.toLowerCase() ||
          u.username?.toLowerCase() === acc.username.toLowerCase()
        );
        if (existing) {
          if (acc.schoolId && existing.schoolId !== acc.schoolId) {
            await setDoc(doc(firestore, 'users', existing.id), {
              schoolId: acc.schoolId,
              fullName: acc.fullName,
              name: acc.name
            }, { merge: true });
          }
        } else {
          const docId = acc.role === 'admin' ? `admin_${acc.username.toLowerCase()}` : `staff_${acc.username.toLowerCase()}`;
          const userDoc: User = {
            id: docId,
            username: acc.username,
            name: acc.name,
            fullName: acc.fullName,
            email: acc.email,
            phone: '',
            role: acc.role,
            schoolId: acc.schoolId,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(firestore, 'users', docId), userDoc, { merge: true });
          await db.saveUser(userDoc);
        }
      } catch {}
    }
  }
}

// Create new Staff/Admin account via Firebase Auth & Firestore
export async function registerStaffOrAdmin(
  email: string,
  pass: string,
  fullName: string,
  role: Role,
  phone?: string,
  customUsername?: string
): Promise<User> {
  const cleanEmail = email.trim();
  const cleanPass = pass.trim();
  const cleanName = fullName.trim();
  const username = customUsername?.trim() || cleanEmail.split('@')[0] || `user_${Date.now()}`;

  let uid = 'u_' + crypto.randomUUID().slice(0, 10);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const fbUser = userCredential.user;
    uid = fbUser.uid;
    await updateProfile(fbUser, { displayName: cleanName });
  } catch (err: any) {
    console.warn('Firebase Auth user creation notice (saving to Firestore directly):', err?.code || err);
    // If operation-not-allowed or similar, proceed to save in Firestore
  }

  const newUser: User = {
    id: uid,
    username,
    name: cleanName,
    fullName: cleanName,
    email: cleanEmail,
    phone: phone?.trim() || '',
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Persist to Firestore users collection
  try {
    await setDoc(doc(firestore, 'users', uid), newUser, { merge: true });
  } catch (firestoreErr) {
    console.warn('Firestore setDoc notice:', firestoreErr);
  }
  await db.saveUser(newUser);

  return newUser;
}

// Google Sign In via Firebase Auth Popup
export async function signInWithGoogle(defaultRole: Role = 'staff'): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;
  
  const appUser = await getAppUserFromFirebase(fbUser);
  if (!appUser.role || appUser.role === 'student') {
    appUser.role = defaultRole;
    await updateDoc(doc(firestore, 'users', fbUser.uid), { role: defaultRole }).catch(() => {});
  }
  return appUser;
}

// Send Firebase Password Reset Email
export async function sendPasswordReset(email: string): Promise<void> {
  let targetEmail = email.trim();
  if (!targetEmail.includes('@')) {
    const allUsers = await db.getUsers();
    const match = allUsers.find(u => u.username.toLowerCase() === targetEmail.toLowerCase());
    if (match && match.email) {
      targetEmail = match.email;
    } else {
      throw new Error('Please provide a valid registered email address.');
    }
  }
  await sendPasswordResetEmail(auth, targetEmail);
}

// Sign out from Firebase Auth
export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
  localStorage.removeItem('activeUser');
}

// Subscribe to Firebase Auth state changes
export function subscribeToAuthState(callback: (user: User | null, firebaseUser: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const appUser = await getAppUserFromFirebase(fbUser);
        if (appUser.schoolId && appUser.schoolId !== 'school_dublin_east' && appUser.role !== 'super_admin') {
          console.warn(`Blocked auth state update: user ${appUser.username} belongs to ${appUser.schoolId}, but portal is Dublin East`);
          await signOut(auth).catch(() => {});
          localStorage.removeItem('activeUser');
          callback(null, null);
          return;
        }
        callback(appUser, fbUser);
      } catch (err) {
        console.warn('Error resolving user from auth state:', err);
        callback(null, fbUser);
      }
    } else {
      callback(null, null);
    }
  });
}
