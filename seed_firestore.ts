import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { TEN_STUDENTS } from './src/lib/seedData';

if (!process.argv.includes('--confirm')) {
  console.error('Safety Guard: seed_firestore will overwrite student collections. To proceed, pass the --confirm flag:');
  console.error('bun seed_firestore.ts --confirm');
  process.exit(1);
}

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function run() {
  console.log('Clearing existing...');
  const studentsSnap = await getDocs(collection(db, 'students'));
  for (const docSnap of studentsSnap.docs) {
    await deleteDoc(doc(db, 'students', docSnap.id));
  }

  console.log('Seeding synthetic students...');
  for (const student of TEN_STUDENTS) {
    await setDoc(doc(db, 'students', student.id), student);
  }
  console.log('Done!');
  process.exit(0);
}

run();
