import { describe, it, expect, beforeEach } from 'vitest';
import { db, getCollectionName } from '../lib/db';
import { 
  parseAppRoute, 
  extractSlugFromPath, 
  resolveSchoolFromHostname, 
  setSimulatedLocation,
  isUserAuthorizedForSchool,
  getSchoolBySlug
} from '../lib/tenantContext';
import { signInWithEmail } from '../lib/auth';

describe('Multi-Region Route-Based and Dedicated Table Architecture', () => {
  beforeEach(() => {
    setSimulatedLocation({ hostname: 'localhost', search: '', pathname: '' });
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('1. Database Table / Collection Resolution', () => {
    it('maps Dublin East strictly to root collections for master branch compatibility', () => {
      expect(getCollectionName('students', 'school_dublin_east')).toBe('students');
      expect(getCollectionName('attendance', 'school_dublin_east')).toBe('attendance');
      expect(getCollectionName('authorized_pickups', 'school_dublin_east')).toBe('authorized_pickups');
    });

    it('maps non-default regions to dedicated table names in database', () => {
      expect(getCollectionName('students', 'school_dublin_west')).toBe('students_dublin_west');
      expect(getCollectionName('attendance', 'school_dublin_west')).toBe('attendance_dublin_west');

      expect(getCollectionName('students', 'school_pleasanton')).toBe('students_pleasanton');
      expect(getCollectionName('attendance', 'school_pleasanton')).toBe('attendance_pleasanton');

      expect(getCollectionName('students', 'school_san_ramon')).toBe('students_san_ramon');
      expect(getCollectionName('attendance', 'school_san_ramon')).toBe('attendance_san_ramon');
    });
  });

  describe('2. Route-Based Path Parsing', () => {
    it('parses global /login route', () => {
      const route = parseAppRoute('/login');
      expect(route.type).toBe('login');
    });

    it('parses school dashboard paths correctly', () => {
      const east = parseAppRoute('/dublin-east/dashboard');
      expect(east).toEqual({ type: 'school', schoolSlug: 'dublin-east', view: 'dashboard' });

      const west = parseAppRoute('/dublin-west/dashboard');
      expect(west).toEqual({ type: 'school', schoolSlug: 'dublin-west', view: 'dashboard' });

      const pleasanton = parseAppRoute('/pleasanton/dashboard');
      expect(pleasanton).toEqual({ type: 'school', schoolSlug: 'pleasanton', view: 'dashboard' });

      const sanRamon = parseAppRoute('/san-ramon/dashboard');
      expect(sanRamon).toEqual({ type: 'school', schoolSlug: 'san-ramon', view: 'dashboard' });
    });

    it('parses school kiosk paths correctly', () => {
      const pleasantonKiosk = parseAppRoute('/pleasanton/kiosk');
      expect(pleasantonKiosk).toEqual({ type: 'school', schoolSlug: 'pleasanton', view: 'kiosk' });
    });

    it('extracts school slug from path and resolves school metadata', () => {
      expect(extractSlugFromPath('/pleasanton/dashboard')).toBe('pleasanton');
      expect(extractSlugFromPath('/san-ramon/kiosk')).toBe('san-ramon');
      expect(extractSlugFromPath('/login')).toBeNull();

      const school = resolveSchoolFromHostname('localhost:3000', '', '/pleasanton/dashboard');
      expect(school.id).toBe('school_pleasanton');
      expect(school.name).toContain('Pleasanton');
      expect(school.themeColor).toBe('#6366f1');
    });
  });

  describe('3. Multi-Region Data Isolation', () => {
    it('returns dedicated student roster for Pleasanton with no cross-contamination', () => {
      const students = db.getStudents('school_pleasanton');
      expect(students.length).toBeGreaterThan(0);
      students.forEach(s => {
        expect(s.schoolId).toBe('school_pleasanton');
      });
      // Dublin East student 10001 is not in Pleasanton
      expect(students.find(s => s.id === '10001')).toBeUndefined();
      // San Ramon student 40001 is not in Pleasanton
      expect(students.find(s => s.id === '40001')).toBeUndefined();
    });

    it('returns dedicated student roster for San Ramon with no cross-contamination', () => {
      const students = db.getStudents('school_san_ramon');
      expect(students.length).toBeGreaterThan(0);
      students.forEach(s => {
        expect(s.schoolId).toBe('school_san_ramon');
      });
      // Dublin East student 10001 is not in San Ramon
      expect(students.find(s => s.id === '10001')).toBeUndefined();
    });

    it('returns dedicated attendance for each new region', () => {
      const pleasantonAtt = db.getAttendance('school_pleasanton');
      expect(pleasantonAtt.length).toBeGreaterThan(0);
      pleasantonAtt.forEach(a => {
        expect(a.schoolId).toBe('school_pleasanton');
      });

      const sanRamonAtt = db.getAttendance('school_san_ramon');
      expect(sanRamonAtt.length).toBeGreaterThan(0);
      sanRamonAtt.forEach(a => {
        expect(a.schoolId).toBe('school_san_ramon');
      });
    });
  });

  describe('4. Global Login Authentication & Route Authorization', () => {
    it('allows Pleasanton Admin to log in globally without school selector', async () => {
      const user = await signInWithEmail('PleasantonAdmin', 'Oh43016');
      expect(user).toBeDefined();
      expect(user.username).toBe('PleasantonAdmin');
      expect(user.schoolId).toBe('school_pleasanton');
      expect(user.role).toBe('admin');
    });

    it('allows San Ramon Admin to log in globally without school selector', async () => {
      const user = await signInWithEmail('SanRamonAdmin', 'Oh43016');
      expect(user).toBeDefined();
      expect(user.username).toBe('SanRamonAdmin');
      expect(user.schoolId).toBe('school_san_ramon');
      expect(user.role).toBe('admin');
    });

    it('enforces route boundary authorization: Pleasanton staff cannot access Dublin East dashboard', async () => {
      const pleasantonStaff = await signInWithEmail('PleasantonStaff', 'Oh43017');
      expect(isUserAuthorizedForSchool(pleasantonStaff, 'school_dublin_east')).toBe(false);
      expect(isUserAuthorizedForSchool(pleasantonStaff, 'school_pleasanton')).toBe(true);
    });

    it('allows SuperAdmin to access any regional dashboard', async () => {
      const superAdmin = await signInWithEmail('SuperAdmin', 'Oh43016');
      expect(isUserAuthorizedForSchool(superAdmin, 'school_dublin_east')).toBe(true);
      expect(isUserAuthorizedForSchool(superAdmin, 'school_dublin_west')).toBe(true);
      expect(isUserAuthorizedForSchool(superAdmin, 'school_pleasanton')).toBe(true);
      expect(isUserAuthorizedForSchool(superAdmin, 'school_san_ramon')).toBe(true);
    });
  });
});
