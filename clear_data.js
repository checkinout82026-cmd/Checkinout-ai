import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function clearCollections() {
  const studentsSnap = await getDocs(collection(db, 'students'));
  for (const docSnap of studentsSnap.docs) {
    await deleteDoc(doc(db, 'students', docSnap.id));
  }

  const pickupsSnap = await getDocs(collection(db, 'authorized_pickups'));
  for (const docSnap of pickupsSnap.docs) {
    await deleteDoc(doc(db, 'authorized_pickups', docSnap.id));
  }

  console.log('Cleared students and pickups');
  process.exit(0);
}

clearCollections();
