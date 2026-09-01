import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

if (!process.argv.includes('--confirm')) {
  console.error('Safety Guard: migrate_attendance will update attendance records. To proceed, pass the --confirm flag:');
  console.error('bun migrate_attendance.ts --confirm');
  process.exit(1);
}

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function run() {
  const attSnap = await getDocs(collection(db, 'attendance'));
  for (const docSnap of attSnap.docs) {
    const data = docSnap.data();
    if (data.studentId && data.studentId.length === 4) {
      if (data.studentId.startsWith('100')) {
        data.studentId = '100' + data.studentId.slice(2);
      } else if (data.studentId === '1010') {
        data.studentId = '10010';
      }
      await setDoc(doc(db, 'attendance', docSnap.id), data);
      console.log(`Updated attendance record ${docSnap.id} studentId to ${data.studentId}`);
    }
  }
  process.exit(0);
}

run();
