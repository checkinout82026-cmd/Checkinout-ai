import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

if (!process.argv.includes('--confirm')) {
  console.error('Safety Guard: clear_data2 will migrate/delete documents. To proceed, pass the --confirm flag:');
  console.error('node clear_data2.js --confirm');
  process.exit(1);
}

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function run() {
  console.log('Fetching students...');
  const studentsSnap = await getDocs(collection(db, 'students'));
  for (const docSnap of studentsSnap.docs) {
    const data = docSnap.data();
    if (data.id && data.id.length === 4 && data.id.startsWith('100')) {
      const newId = '100' + data.id.slice(2); // e.g. 1001 -> 10001
      data.id = newId;
      await setDoc(doc(db, 'students', newId), data);
      await deleteDoc(doc(db, 'students', docSnap.id));
      console.log(`Migrated ${docSnap.id} to ${newId}`);
    } else {
       await deleteDoc(doc(db, 'students', docSnap.id));
       console.log(`Deleted ${docSnap.id}`);
    }
  }

  console.log('Done migrating students');
  process.exit(0);
}

run();
