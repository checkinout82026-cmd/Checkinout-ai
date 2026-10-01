// Polyfill localStorage in Node/Vitest environment
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, String(value));
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => {
    store.clear();
  },
  get length() {
    return store.size;
  },
  key: (index: number) => Array.from(store.keys())[index] ?? null
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>();
  return {
    ...actual,
    setDoc: vi.fn().mockResolvedValue(undefined),
    getDocs: vi.fn().mockResolvedValue({ docs: [], forEach: vi.fn() }),
    onSnapshot: vi.fn().mockReturnValue(() => {})
  };
});

import { db, DUBLIN_EAST_ID } from '../lib/db';
import { signInWithEmail } from '../lib/auth';
import { Student, AttendanceRecord } from '../types';

describe('Main Branch Database Compatibility (Dublin East Scoping)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defines DUBLIN_EAST_ID as school_dublin_east', () => {
    expect(DUBLIN_EAST_ID).toBe('school_dublin_east');
  });

  it('automatically stamps newly saved students with school_dublin_east', async () => {
    const student: Student = {
      id: 'east-test-student-1',
      name: 'East Test Student',
      parent: { name: 'Parent One', phone: '555-1111' },
      authorizedPickups: ['Parent One']
    };

    await db.saveStudent(student);

    const saved = db.getStudents().find(s => s.id === 'east-test-student-1');
    expect(saved).toBeDefined();
    expect(saved?.schoolId).toBe('school_dublin_east');
  });

  it('automatically stamps newly saved attendance records with school_dublin_east', async () => {
    const record: AttendanceRecord = {
      id: 'att-east-test-1',
      studentId: 'east-test-student-1',
      date: '2026-10-01',
      checkInTime: new Date().toISOString(),
      checkOutTime: null
    };

    await db.saveAttendanceRecord(record);

    const saved = db.getAttendance().find(r => r.id === 'att-east-test-1');
    expect(saved).toBeDefined();
    expect(saved?.schoolId).toBe('school_dublin_east');
  });

  it('rejects login attempts using Dublin West credentials', async () => {
    // Sanjay is configured as Dublin West admin
    await expect(signInWithEmail('Sanjay', 'Oh43016')).rejects.toThrow(
      /This account belongs to Dublin - West/i
    );
  });
});
