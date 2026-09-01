import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

if (!process.argv.includes('--confirm')) {
  console.error('Safety Guard: clear_data will delete collections. To proceed, pass the --confirm flag:');
  console.error('node clear_data.js --confirm');
  process.exit(1);
}

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function clearCollections() {
  console.log('Clearing students collection...');
  const studentsSnap = await getDocs(collection(db, 'students'));
  for (const docSnap of studentsSnap.docs) {
    await deleteDoc(doc(db, 'students', docSnap.id));
  }

  console.log('Clearing authorized_pickups collection...');
  const pickupsSnap = await getDocs(collection(db, 'authorized_pickups'));
  for (const docSnap of pickupsSnap.docs) {
    await deleteDoc(doc(db, 'authorized_pickups', docSnap.id));
  }

  console.log('Cleared students and pickups');
  process.exit(0);
}

clearCollections();
