import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const studentsSnap = await getDocs(collection(db, 'students'));
  console.log(`Found ${studentsSnap.docs.length} students`);
  for (const docSnap of studentsSnap.docs) {
    console.log(docSnap.id);
  }
  process.exit(0);
}

run();
