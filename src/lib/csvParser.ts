import { AttendanceRecord, Student } from '../types';

/**
 * Robust CSV line splitter that handles quotes, commas within quotes, and escaped quotes.
 */
export function parseCSVLines(csvText: string): string[][] {
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const result: string[][] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const row: string[] = [];
    let insideQuotes = false;
    let currentVal = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentVal += '"';
          i++; // skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    row.push(currentVal.trim());
    result.push(row);
  }

  return result;
}

/**
 * Convert 12-hour time string like "5:28 PM" or "12:13 PM" or "17:28" to ISO Date string on given date YYYY-MM-DD
 */
export function convertTimeToIso(dateStr: string, timeStr?: string | null): string | null {
  if (!timeStr || !timeStr.trim()) return null;
  const t = timeStr.trim();

  // If already ISO string
  if (t.includes('T') || t.includes('Z')) return t;

  let hours = 0;
  let minutes = 0;

  // Handle 12-hour AM/PM format (e.g., "5:28 PM", "12:15 AM")
  const ampmMatch = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const meridian = ampmMatch[3]?.toUpperCase();

    if (meridian === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridian === 'AM' && hours === 12) {
      hours = 0;
    }
  } else {
    // Try simple HH:MM
    const parts = t.split(':');
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    } else {
      return null;
    }
  }

  const paddedH = hours.toString().padStart(2, '0');
  const paddedM = minutes.toString().padStart(2, '0');

  try {
    return new Date(`${dateStr}T${paddedH}:${paddedM}:00`).toISOString();
  } catch {
    return `${dateStr}T${paddedH}:${paddedM}:00.000Z`;
  }
}

/**
 * Parses attendance CSV text into AttendanceRecord array
 */
export function parseAttendanceCSV(csvText: string, existingStudents: Student[] = []): AttendanceRecord[] {
  const rows = parseCSVLines(csvText);
  if (rows.length < 2) return [];

  const headerRow = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Find column indices
  const dateIdx = headerRow.findIndex(h => h.includes('date'));
  const idIdx = headerRow.findIndex(h => h.includes('studentid') || h.includes('id'));
  const nameIdx = headerRow.findIndex(h => h.includes('name') && !h.includes('staff'));
  const inTimeIdx = headerRow.findIndex(h => h.includes('checkin') && h.includes('time') || h === 'checkin' || h === 'intime');
  const inStaffIdx = headerRow.findIndex(h => h.includes('checkin') && h.includes('staff') || h === 'instaff');
  const outTimeIdx = headerRow.findIndex(h => h.includes('checkout') && h.includes('time') || h === 'checkout' || h === 'outtime');
  const outStaffIdx = headerRow.findIndex(h => h.includes('checkout') && h.includes('staff') || h === 'outstaff');
  const pickupIdx = headerRow.findIndex(h => h.includes('pickup') || h.includes('guardian'));

  const records: AttendanceRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length === 0 || !cols.some(c => c.length > 0)) continue;

    const dateVal = (dateIdx !== -1 && cols[dateIdx]) ? cols[dateIdx].trim() : new Date().toISOString().split('T')[0];
    const studentId = (idIdx !== -1 && cols[idIdx]) ? cols[idIdx].trim().replace(/^"+|"+$/g, '') : '';
    if (!studentId) continue;

    const rawStudentName = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx].trim() : '';
    const matchedStudent = existingStudents.find(s => s.id === studentId);
    const studentName = matchedStudent?.name || rawStudentName || `Student ${studentId}`;

    const inTimeRaw = (inTimeIdx !== -1 && cols[inTimeIdx]) ? cols[inTimeIdx].trim() : '';
    const inStaffRaw = (inStaffIdx !== -1 && cols[inStaffIdx]) ? cols[inStaffIdx].trim() : '';
    const outTimeRaw = (outTimeIdx !== -1 && cols[outTimeIdx]) ? cols[outTimeIdx].trim() : '';
    const outStaffRaw = (outStaffIdx !== -1 && cols[outStaffIdx]) ? cols[outStaffIdx].trim() : '';
    const pickupPerson = (pickupIdx !== -1 && cols[pickupIdx]) ? cols[pickupIdx].trim() : '';

    const checkInIso = convertTimeToIso(dateVal, inTimeRaw);
    const checkOutIso = convertTimeToIso(dateVal, outTimeRaw);

    const recordId = `att_${dateVal.replace(/-/g, '')}_${studentId}_${i}`;

    const record: AttendanceRecord = {
      id: recordId,
      studentId,
      studentName,
      date: dateVal,
      status: checkOutIso ? 'checked_out' : 'checked_in',
      checkInTime: checkInIso || new Date(`${dateVal}T12:00:00`).toISOString(),
      checkInStaffName: inStaffRaw || 'Self-Service Kiosk',
      checkInMethod: inStaffRaw.toLowerCase().includes('kiosk') ? 'student_self' : 'staff_manual',
      checkOutTime: checkOutIso,
      checkOutStaffName: outStaffRaw || (checkOutIso ? 'Student Kiosk Terminal' : null),
      pickupPerson: pickupPerson || null,
      pickupPersonName: pickupPerson || null,
      smsNotificationSent: true,
      createdAt: checkInIso || new Date().toISOString(),
      updatedAt: checkOutIso || checkInIso || new Date().toISOString()
    };

    records.push(record);
  }

  return records;
}

/**
 * Parses student roster CSV text into Student array
 */
export function parseStudentCSV(csvText: string): Student[] {
  const rows = parseCSVLines(csvText);
  if (rows.length < 2) return [];

  const rawHeader = rows[0];
  const headerRow = rawHeader.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Check if it's the Kumon Center multi-column format (e.g., First Name, Last Name, Mother First Name, Father First Name, etc.)
  const isKumonMultiColumn = headerRow.some(h => h.includes('mother') || h.includes('father') || (headerRow.includes('firstname') && headerRow.includes('lastname')));

  if (isKumonMultiColumn) {
    const idIdx = headerRow.findIndex(h => h.includes('studentid') || h === 'id');
    const fNameIdx = headerRow.findIndex(h => h === 'firstname' || (h.includes('first') && !h.includes('mother') && !h.includes('father')));
    const lNameIdx = headerRow.findIndex(h => h === 'lastname' || (h.includes('last') && !h.includes('mother') && !h.includes('father')));
    const nameIdx = headerRow.findIndex(h => (h.includes('studentname') || h === 'name') && !h.includes('parent'));
    const homePhoneIdx = headerRow.findIndex(h => h.includes('homephone') || h === 'phone');

    const mFirstIdx = headerRow.findIndex(h => h.includes('mother') && h.includes('first'));
    const mLastIdx = headerRow.findIndex(h => h.includes('mother') && h.includes('last'));
    const mPhoneIdx = headerRow.findIndex(h => h.includes('mother') && (h.includes('phone') || h.includes('cell') || h.includes('mobile')));

    const fFirstIdx = headerRow.findIndex(h => h.includes('father') && h.includes('first'));
    const fLastIdx = headerRow.findIndex(h => h.includes('father') && h.includes('last'));
    const fPhoneIdx = headerRow.findIndex(h => h.includes('father') && (h.includes('phone') || h.includes('cell') || h.includes('mobile')));

    const formatPhone = (num?: string) => {
      if (!num) return '';
      const digits = num.replace(/\D/g, '');
      if (!digits) return '';
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) - ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) - ${digits.slice(3, 6)}- ${digits.slice(6, 10)}`;
    };

    const toTitle = (str?: string) => {
      if (!str) return '';
      return str.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const students: Student[] = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (cols.length === 0 || !cols.some(c => c.length > 0)) continue;

      const sid = (idIdx !== -1 && cols[idIdx]) ? cols[idIdx].trim().replace(/^"+|"+$/g, '') : `8402${i.toString().padStart(9, '0')}`;
      
      let sName = '';
      if (fNameIdx !== -1 && lNameIdx !== -1 && (cols[fNameIdx] || cols[lNameIdx])) {
        sName = toTitle(`${cols[fNameIdx] || ''} ${cols[lNameIdx] || ''}`);
      } else if (nameIdx !== -1 && cols[nameIdx]) {
        sName = toTitle(cols[nameIdx]);
      } else {
        sName = `Student ${sid}`;
      }

      const homePhone = (homePhoneIdx !== -1 && cols[homePhoneIdx]) ? formatPhone(cols[homePhoneIdx]) : '';
      
      const mFirst = (mFirstIdx !== -1 && cols[mFirstIdx]) ? cols[mFirstIdx].trim() : '';
      const mLast = (mLastIdx !== -1 && cols[mLastIdx]) ? cols[mLastIdx].trim() : '';
      const motherName = toTitle(`${mFirst} ${mLast}`);
      const motherPhone = (mPhoneIdx !== -1 && cols[mPhoneIdx]) ? formatPhone(cols[mPhoneIdx]) : homePhone;

      const fFirst = (fFirstIdx !== -1 && cols[fFirstIdx]) ? cols[fFirstIdx].trim() : '';
      const fLast = (fLastIdx !== -1 && cols[fLastIdx]) ? cols[fLastIdx].trim() : '';
      const fatherName = toTitle(`${fFirst} ${fLast}`);
      const fatherPhone = (fPhoneIdx !== -1 && cols[fPhoneIdx]) ? formatPhone(cols[fPhoneIdx]) : homePhone;

      const pickups: { name: string; relationship: string; phone: string; isPrimary: boolean }[] = [];
      if (motherName) {
        pickups.push({
          name: motherName,
          relationship: 'Mother',
          phone: motherPhone || homePhone,
          isPrimary: true
        });
      }
      if (fatherName) {
        pickups.push({
          name: fatherName,
          relationship: 'Father',
          phone: fatherPhone || homePhone,
          isPrimary: pickups.length === 0
        });
      }
      if (pickups.length === 0) {
        pickups.push({
          name: `${sName} Guardian`,
          relationship: 'Primary Guardian',
          phone: homePhone || '(614) - 555- 0000',
          isPrimary: true
        });
      }

      const primary = pickups[0];
      const secondary = pickups.length > 1 ? pickups[1] : null;

      const student: Student = {
        id: sid,
        name: sName,
        fullName: sName,
        gradeLevel: 'Kumon Student',
        parent: {
          name: primary.name,
          phone: primary.phone,
          phone2: secondary ? secondary.phone : '',
          email: ''
        },
        parentName: primary.name,
        parentPhone: primary.phone,
        parentPhone2: secondary ? secondary.phone : '',
        parentEmail: '',
        authorizedPickups: pickups.map(p => p.name),
        authorizedPickupDetails: pickups,
        notes: homePhone ? `Home Phone: ${homePhone}` : '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      students.push(student);
    }

    return students;
  }

  // Standard generic format
  const idIdx = headerRow.findIndex(h => h.includes('studentid') || h === 'id');
  const nameIdx = headerRow.findIndex(h => (h.includes('studentname') || h.includes('fullname') || h === 'name') && !h.includes('parent'));
  const gradeIdx = headerRow.findIndex(h => h.includes('grade'));
  const parentNameIdx = headerRow.findIndex(h => h.includes('parentname') || h.includes('parent') || h.includes('guardian'));
  const parentPhoneIdx = headerRow.findIndex(h => h.includes('phone') || h.includes('mobile'));
  const parentEmailIdx = headerRow.findIndex(h => h.includes('email'));
  const pickupsIdx = headerRow.findIndex(h => h.includes('pickup') || h.includes('authorized'));
  const notesIdx = headerRow.findIndex(h => h.includes('note') || h.includes('allerg'));

  const students: Student[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length === 0 || !cols.some(c => c.length > 0)) continue;

    const studentId = (idIdx !== -1 && cols[idIdx]) ? cols[idIdx].trim().replace(/^"+|"+$/g, '') : `1000${i}`;
    const name = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx].trim() : `Student ${studentId}`;
    const grade = (gradeIdx !== -1 && cols[gradeIdx]) ? cols[gradeIdx].trim() : 'Kindergarten';
    const pName = (parentNameIdx !== -1 && cols[parentNameIdx]) ? cols[parentNameIdx].trim() : `${name} Guardian`;
    const pPhone = (parentPhoneIdx !== -1 && cols[parentPhoneIdx]) ? cols[parentPhoneIdx].trim() : '555-0100';
    const pEmail = (parentEmailIdx !== -1 && cols[parentEmailIdx]) ? cols[parentEmailIdx].trim() : '';
    const rawPickups = (pickupsIdx !== -1 && cols[pickupsIdx]) ? cols[pickupsIdx].trim() : '';
    const pickupsList = rawPickups 
      ? rawPickups.split(/[,;]/).map(p => p.trim()).filter(Boolean)
      : [pName];
    const notesVal = (notesIdx !== -1 && cols[notesIdx]) ? cols[notesIdx].trim() : '';

    const student: Student = {
      id: studentId,
      name,
      fullName: name,
      gradeLevel: grade,
      parent: {
        name: pName,
        phone: pPhone,
        email: pEmail
      },
      parentName: pName,
      parentPhone: pPhone,
      parentEmail: pEmail,
      authorizedPickups: pickupsList,
      authorizedPickupDetails: pickupsList.map((p, pIdx) => ({
        name: p,
        relationship: pIdx === 0 ? 'Primary Guardian' : 'Authorized Pickup',
        phone: pPhone,
        isPrimary: pIdx === 0
      })),
      notes: notesVal,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    students.push(student);
  }

  return students;
}

