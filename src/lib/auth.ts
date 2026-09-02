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
import { db, defaultUsers } from './db';

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

  // Load all users from Firestore / local storage to resolve email
  const allUsers = await db.loadUsersFromFirestore();

  // Look for a match by username (case-insensitive) or email
  const match = allUsers.find(u => 
    u.username?.toLowerCase() === cleanInput.toLowerCase() ||
    u.email?.toLowerCase() === cleanInput.toLowerCase() ||
    u.id?.toLowerCase() === cleanInput.toLowerCase()
  );

  let emailToUse = cleanInput;
  if (!emailToUse.includes('@')) {
    if (match && match.email) {
      emailToUse = match.email;
    } else {
      emailToUse = `${cleanInput.toLowerCase()}@school.org`;
    }
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
    const appUser = await getAppUserFromFirebase(userCredential.user);
    return {
      ...appUser,
      username: match?.username || appUser.username
    };
  } catch (authError: any) {
    console.warn('Firebase Auth error:', authError?.code);

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
