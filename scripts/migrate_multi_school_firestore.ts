import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { SCHOOL_B_STUDENTS, SCHOOL_B_ATTENDANCE } from '../src/lib/seedData';
import { CONFIGURED_ACCOUNTS } from '../src/lib/auth';

const isDryRun = process.argv.includes('--dry-run');
const isConfirm = process.argv.includes('--confirm');

if (!isDryRun && !isConfirm) {
  console.log(`
========================================================================
 Multi-School Firestore Migration & Provisioning Tool
========================================================================
Usage:
  npx tsx scripts/migrate_multi_school_firestore.ts --dry-run
  npx tsx scripts/migrate_multi_school_firestore.ts --confirm

Options:
  --dry-run   Inspect documents and display proposed changes without writing.
  --confirm   Execute live batch updates to the Cloud Firestore database.
========================================================================
`);
  process.exit(1);
}

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = getApps().find(a => a.name === 'migration-app') || initializeApp(config, 'migration-app');
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function runMigration() {
  console.log(`\n🚀 Initializing migration against:`);
  console.log(`   Project ID:  ${config.projectId}`);
  console.log(`   Database ID: ${config.firestoreDatabaseId || '(default)'}`);
  console.log(`   Mode:        ${isDryRun ? '🔍 DRY RUN (Read-Only)' : '⚡ LIVE WRITE (--confirm)'}\n`);

  // 1. Audit & Migrate Existing Students -> Dublin East
  console.log('--- Step 1: Processing Students Collection ---');
  const studentsSnap = await getDocs(collection(db, 'students'));
  let studentsNeedingEast = 0;
  let studentsAlreadyTagged = 0;
  const studentUpdates: { id: string; data: any }[] = [];

  studentsSnap.forEach(d => {
    const data = d.data();
    if (!data.schoolId) {
      studentsNeedingEast++;
      studentUpdates.push({ id: d.id, data: { schoolId: 'school_dublin_east' } });
    } else {
      studentsAlreadyTagged++;
    }
  });
  console.log(`Total students in DB: ${studentsSnap.size}`);
  console.log(` - Students to tag as Dublin East: ${studentsNeedingEast}`);
  console.log(` - Students already tagged with schoolId: ${studentsAlreadyTagged}`);

  // 2. Audit & Migrate Existing Attendance -> Dublin East
  console.log('\n--- Step 2: Processing Attendance Collection ---');
  const attendanceSnap = await getDocs(collection(db, 'attendance'));
  let attendanceNeedingEast = 0;
  let attendanceAlreadyTagged = 0;
  const attendanceUpdates: { id: string; data: any }[] = [];

  attendanceSnap.forEach(d => {
    const data = d.data();
    if (!data.schoolId) {
      attendanceNeedingEast++;
      attendanceUpdates.push({ id: d.id, data: { schoolId: 'school_dublin_east' } });
    } else {
      attendanceAlreadyTagged++;
    }
  });
  console.log(`Total attendance records in DB: ${attendanceSnap.size}`);
  console.log(` - Attendance records to tag as Dublin East: ${attendanceNeedingEast}`);
  console.log(` - Attendance records already tagged: ${attendanceAlreadyTagged}`);

  // 3. Audit & Migrate Authorized Pickups -> Dublin East
  console.log('\n--- Step 3: Processing Authorized Pickups Collection ---');
  const pickupsSnap = await getDocs(collection(db, 'authorized_pickups'));
  let pickupsNeedingEast = 0;
  let pickupsAlreadyTagged = 0;
  const pickupUpdates: { id: string; data: any }[] = [];

  pickupsSnap.forEach(d => {
    const data = d.data();
    if (!data.schoolId) {
      pickupsNeedingEast++;
      pickupUpdates.push({ id: d.id, data: { schoolId: 'school_dublin_east' } });
    } else {
      pickupsAlreadyTagged++;
    }
  });
  console.log(`Total pickup records in DB: ${pickupsSnap.size}`);
  console.log(` - Pickup records to tag as Dublin East: ${pickupsNeedingEast}`);
  console.log(` - Pickup records already tagged: ${pickupsAlreadyTagged}`);

  // 4. Audit & Migrate Users Collection
  console.log('\n--- Step 4: Processing Users Collection ---');
  const usersSnap = await getDocs(collection(db, 'users'));
  const userUpdates: { id: string; data: any }[] = [];
  const existingUserMap = new Map<string, any>();

  usersSnap.forEach(d => {
    const data = d.data();
    existingUserMap.set(d.id, data);
    const uLower = (data.username || '').toLowerCase();
    const nameLower = (data.name || '').toLowerCase();

    if (uLower === 'sanjay' || nameLower.includes('sanjay') || uLower === 'weststaff') {
      if (data.schoolId !== 'school_dublin_west') {
        userUpdates.push({ id: d.id, data: { schoolId: 'school_dublin_west' } });
      }
    } else if (uLower === 'superadmin') {
      // Super admin remains cross-school (schoolId: null/undefined)
    } else if (!data.schoolId) {
      userUpdates.push({ id: d.id, data: { schoolId: 'school_dublin_east' } });
    }
  });
  console.log(`Total users in DB: ${usersSnap.size}`);
  console.log(` - Users to update schoolId: ${userUpdates.length}`);

  // 5. Plan Dublin West Demo Provisioning
  console.log('\n--- Step 5: Preparing Dublin West Demo Data ---');
  console.log(` - Dublin West Demo Students to provision: ${SCHOOL_B_STUDENTS.length}`);
  console.log(` - Dublin West Attendance records to provision: ${SCHOOL_B_ATTENDANCE.length}`);

  const westUsersToEnsure = CONFIGURED_ACCOUNTS.filter(a => a.schoolId === 'school_dublin_west');
  console.log(` - Dublin West Staff accounts to ensure: ${westUsersToEnsure.map(a => a.username).join(', ')}`);

  if (isDryRun) {
    console.log('\n========================================================================');
    console.log('✅ DRY RUN COMPLETE: 0 database writes were performed.');
    console.log('To apply these changes live, run with the --confirm flag:');
    console.log('  npx tsx scripts/migrate_multi_school_firestore.ts --confirm');
    console.log('========================================================================\n');
    process.exit(0);
  }

  // Live Execution with batched writes
  console.log('\n⚡ Commencing live database updates...');

  // Helper to commit batches safely (max 250 ops per batch)
  let currentBatch = writeBatch(db);
  let opCount = 0;
  let totalCommitted = 0;

  async function queueWrite(docRef: any, data: any, merge = true) {
    currentBatch.set(docRef, data, { merge });
    opCount++;
    if (opCount >= 200) {
      await currentBatch.commit();
      totalCommitted += opCount;
      console.log(`   Committed ${totalCommitted} database operations...`);
      currentBatch = writeBatch(db);
      opCount = 0;
    }
  }

  // Apply Student Updates
  for (const item of studentUpdates) {
    await queueWrite(doc(db, 'students', item.id), item.data);
  }

  // Apply Attendance Updates
  for (const item of attendanceUpdates) {
    await queueWrite(doc(db, 'attendance', item.id), item.data);
  }

  // Apply Pickup Updates
  for (const item of pickupUpdates) {
    await queueWrite(doc(db, 'authorized_pickups', item.id), item.data);
  }

  // Apply User Updates
  for (const item of userUpdates) {
    await queueWrite(doc(db, 'users', item.id), item.data);
  }

  // Ensure West Staff Accounts
  for (const acc of westUsersToEnsure) {
    const docId = acc.role === 'admin' ? `admin_${acc.username.toLowerCase()}` : `staff_${acc.username.toLowerCase()}`;
    await queueWrite(doc(db, 'users', docId), {
      id: docId,
      username: acc.username,
      name: acc.name,
      fullName: acc.fullName,
      email: acc.email,
      phone: '',
      role: acc.role,
      schoolId: 'school_dublin_west',
      isActive: true,
      updatedAt: new Date().toISOString()
    });
  }

  // Insert Dublin West Demo Students & Pickups
  for (const s of SCHOOL_B_STUDENTS) {
    const studentRef = doc(db, 'students', s.id);
    await queueWrite(studentRef, {
      id: s.id,
      name: s.name,
      fullName: s.fullName,
      gradeLevel: s.gradeLevel,
      schoolId: 'school_dublin_west',
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      parentPhone2: s.parentPhone2 || '',
      parentEmail: s.parentEmail,
      parent: s.parent,
      authorizedPickups: s.authorizedPickups,
      authorizedPickupDetails: s.authorizedPickupDetails,
      notes: s.notes || '',
      isActive: true,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    });

    // Pickups sub-records
    for (const p of s.authorizedPickupDetails || []) {
      const pId = `pickup_${s.id}_${p.name.replace(/\s+/g, '_').toLowerCase()}`;
      await queueWrite(doc(db, 'authorized_pickups', pId), {
        id: pId,
        studentId: s.id,
        schoolId: 'school_dublin_west',
        name: p.name,
        relationship: p.relationship || 'Guardian',
        phone: p.phone,
        isPrimary: p.isPrimary || false,
        createdAt: s.createdAt
      });
    }
  }

  // Insert Dublin West Demo Attendance
  for (const att of SCHOOL_B_ATTENDANCE) {
    await queueWrite(doc(db, 'attendance', att.id), {
      ...att,
      schoolId: 'school_dublin_west'
    });
  }

  // Flush remaining batch
  if (opCount > 0) {
    await currentBatch.commit();
    totalCommitted += opCount;
  }

  console.log(`\n🎉 MIGRATION SUCCESSFUL! Total operations executed: ${totalCommitted}`);
  process.exit(0);
}

runMigration().catch(err => {
  console.error('\n❌ Migration failed with error:', err);
  process.exit(1);
});
