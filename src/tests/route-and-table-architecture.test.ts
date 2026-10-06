import { describe, it, expect, beforeEach } from 'vitest';
import { db, getCollectionName, deduplicateUsers, deduplicateStudents } from '../lib/db';
import { 
  parseAppRoute, 
  extractSlugFromPath, 
  resolveSchoolFromHostname, 
  setSimulatedLocation,
  isUserAuthorizedForSchool,
  getSchoolBySlug
} from '../lib/tenantContext';
import { signInWithEmail, registerStaffOrAdmin } from '../lib/auth';

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

  describe('5. Manage Staff School-Scoping & Admin Isolation', () => {
    it('returns only Pleasanton staff/admins for school_pleasanton with no cross-school leak', () => {
      const pleasantonUsers = db.getUsers('school_pleasanton');
      expect(pleasantonUsers.length).toBeGreaterThan(0);
      pleasantonUsers.forEach(u => {
        expect(u.schoolId).toBe('school_pleasanton');
      });

      // Must contain Pleasanton accounts
      expect(pleasantonUsers.some(u => u.username === 'PleasantonAdmin')).toBe(true);
      expect(pleasantonUsers.some(u => u.username === 'PleasantonStaff')).toBe(true);

      // Must NOT contain Dublin East, Dublin West, San Ramon, or SuperAdmin
      expect(pleasantonUsers.some(u => u.username === 'Ajita')).toBe(false);
      expect(pleasantonUsers.some(u => u.username === 'CenterStaff')).toBe(false);
      expect(pleasantonUsers.some(u => u.username === 'Sanjay')).toBe(false);
      expect(pleasantonUsers.some(u => u.username === 'WestStaff')).toBe(false);
      expect(pleasantonUsers.some(u => u.username === 'SanRamonAdmin')).toBe(false);
      expect(pleasantonUsers.some(u => u.username === 'SuperAdmin')).toBe(false);
    });

    it('returns only San Ramon staff/admins for school_san_ramon with no cross-school leak', () => {
      const sanRamonUsers = db.getUsers('school_san_ramon');
      expect(sanRamonUsers.length).toBeGreaterThan(0);
      sanRamonUsers.forEach(u => {
        expect(u.schoolId).toBe('school_san_ramon');
      });

      expect(sanRamonUsers.some(u => u.username === 'SanRamonAdmin')).toBe(true);
      expect(sanRamonUsers.some(u => u.username === 'SanRamonStaff')).toBe(true);

      // Must NOT contain Pleasanton, Dublin East, or Dublin West accounts
      expect(sanRamonUsers.some(u => u.username === 'PleasantonAdmin')).toBe(false);
      expect(sanRamonUsers.some(u => u.username === 'Ajita')).toBe(false);
      expect(sanRamonUsers.some(u => u.username === 'Sanjay')).toBe(false);
    });

    it('returns only Dublin East staff/admins for school_dublin_east including Sanjay', () => {
      const dublinEastUsers = db.getUsers('school_dublin_east');
      expect(dublinEastUsers.length).toBeGreaterThan(0);
      dublinEastUsers.forEach(u => {
        expect(u.schoolId === 'school_dublin_east' || !u.schoolId).toBe(true);
      });

      expect(dublinEastUsers.some(u => u.username === 'Ajita')).toBe(true);
      expect(dublinEastUsers.some(u => u.username === 'CenterStaff')).toBe(true);
      expect(dublinEastUsers.some(u => u.username === 'Sanjay')).toBe(true);

      expect(dublinEastUsers.some(u => u.username === 'PleasantonAdmin')).toBe(false);
      expect(dublinEastUsers.some(u => u.username === 'SanRamonAdmin')).toBe(false);
      expect(dublinEastUsers.some(u => u.username === 'WestStaff')).toBe(false);
      expect(dublinEastUsers.some(u => u.username === 'WestAdmin')).toBe(false);
    });

    it('returns only Dublin West staff/admins for school_dublin_west with WestAdmin', () => {
      const dublinWestUsers = db.getUsers('school_dublin_west');
      expect(dublinWestUsers.length).toBeGreaterThan(0);
      dublinWestUsers.forEach(u => {
        expect(u.schoolId).toBe('school_dublin_west');
      });

      expect(dublinWestUsers.some(u => u.username === 'WestAdmin')).toBe(true);
      expect(dublinWestUsers.some(u => u.username === 'WestStaff')).toBe(true);

      // Sanjay must NOT be in Dublin West
      expect(dublinWestUsers.some(u => u.username === 'Sanjay')).toBe(false);
      expect(dublinWestUsers.some(u => u.username === 'Ajita')).toBe(false);
    });

    it('delivers isolated users for active campus via db.subscribeUsers', () => {
      let receivedUsers: any[] = [];
      const unsub = db.subscribeUsers(users => {
        receivedUsers = users;
      }, 'school_pleasanton');

      expect(receivedUsers.length).toBeGreaterThan(0);
      receivedUsers.forEach(u => {
        expect(u.schoolId).toBe('school_pleasanton');
      });
      expect(receivedUsers.some(u => u.username === 'Ajita')).toBe(false);
      expect(receivedUsers.some(u => u.username === 'PleasantonAdmin')).toBe(true);

      if (typeof unsub === 'function') unsub();
    });

    it('assigns schoolId when creating staff via registerStaffOrAdmin', async () => {
      const newStaff = await registerStaffOrAdmin(
        'newstaff@pleasanton.org',
        'Oh43017',
        'New Pleasanton Staff',
        'staff',
        '',
        'NewPleasantonStaff',
        'school_pleasanton'
      );

      expect(newStaff.schoolId).toBe('school_pleasanton');
      expect(newStaff.username).toBe('NewPleasantonStaff');

      const pleasantonUsers = db.getUsers('school_pleasanton');
      expect(pleasantonUsers.some(u => u.username === 'NewPleasantonStaff')).toBe(true);

      const dublinEastUsers = db.getUsers('school_dublin_east');
      expect(dublinEastUsers.some(u => u.username === 'NewPleasantonStaff')).toBe(false);
    });

    it('protects against deleting the last remaining admin of a specific campus', async () => {
      // Pleasanton has 1 admin (PleasantonAdmin)
      const pleasantonAdmin = db.getUsers('school_pleasanton').find(u => u.username === 'PleasantonAdmin');
      expect(pleasantonAdmin).toBeDefined();

      // Deleting the sole admin of Pleasanton must throw an error even though other campuses have admins
      await expect(db.deleteUser(pleasantonAdmin!.id)).rejects.toThrow(
        /Cannot delete the last remaining administrator account/
      );
    });

    it('authenticates WestAdmin and guarantees schoolId is strictly school_dublin_west', async () => {
      const westAdmin = await signInWithEmail('WestAdmin', 'Oh43016');
      expect(westAdmin).toBeDefined();
      expect(westAdmin.schoolId).toBe('school_dublin_west');
      expect(westAdmin.role).toBe('admin');
    });

    it('deduplicates users and guarantees no double entries exist in any region', () => {
      const allRegions = ['school_dublin_east', 'school_dublin_west', 'school_pleasanton', 'school_san_ramon'];

      for (const regionId of allRegions) {
        const staff = db.getUsers(regionId);
        const usernames = staff.map(u => (u.username || '').toLowerCase().trim());
        const uniqueUsernames = new Set(usernames);

        // Assert no duplicate usernames exist in the staff list for this region
        expect(usernames.length).toBe(uniqueUsernames.size);
      }

      // Verify deduplicateUsers collapses fallback IDs with Firebase Auth UIDs
      const mockRawList = [
        { id: 'uid_real_123', username: 'TestAdmin', name: 'Real Admin', role: 'admin' as const, schoolId: 'school_dublin_west' },
        { id: 'admin_testadmin', username: 'TestAdmin', name: 'Fallback Admin', role: 'admin' as const, schoolId: 'school_dublin_west' }
      ];
      const deduped = deduplicateUsers(mockRawList);
      expect(deduped.length).toBe(1);
      expect(deduped[0].id).toBe('uid_real_123');
    });
  });

  describe('6. Student Deduplication & Manage Students Roster Isolation', () => {
    it('deduplicates students by canonical ID and prefers richer details', () => {
      const mockStudents = [
        {
          id: '20001',
          schoolId: 'school_dublin_west',
          name: 'Leo Garcia',
          fullName: 'Leo Garcia',
          gradeLevel: 'Kumon Student',
          parent: { name: 'Carlos Garcia', phone: '555-0202', email: 'carlos.garcia@example.com' },
          parentName: 'Carlos Garcia',
          parentPhone: '555-0202',
          parentEmail: 'carlos.garcia@example.com',
          authorizedPickups: ['Carlos Garcia'],
          authorizedPickupDetails: [],
          notes: '',
          isActive: true
        },
        {
          id: '20001',
          schoolId: 'school_dublin_west',
          name: 'Leo Garcia',
          fullName: 'Leo Garcia',
          gradeLevel: 'Kumon Student',
          parent: { name: 'Carlos Garcia', phone: '555-0202', email: 'carlos.garcia@example.com' },
          parentName: 'Carlos Garcia',
          parentPhone: '555-0202',
          parentEmail: 'carlos.garcia@example.com',
          authorizedPickups: ['Carlos Garcia', 'Maria Garcia'],
          authorizedPickupDetails: [
            { name: 'Carlos Garcia', relationship: 'Father', phone: '555-0202', isPrimary: true },
            { name: 'Maria Garcia', relationship: 'Mother', phone: '555-0203', isPrimary: false }
          ],
          notes: 'West Campus Student - Nut allergy',
          isActive: true
        }
      ];

      const deduped = deduplicateStudents(mockStudents as any);
      expect(deduped.length).toBe(1);
      expect(deduped[0].id).toBe('20001');
      expect(deduped[0].notes).toBe('West Campus Student - Nut allergy');
      expect(deduped[0].authorizedPickups?.length).toBe(2);
    });

    it('deduplicates students with identical name in the same school', () => {
      const duplicateNamed = [
        {
          id: 'temp_1',
          schoolId: 'school_dublin_west',
          name: 'Maya Lin',
          fullName: 'Maya Lin',
          parent: { name: 'Helen Lin', phone: '555-0212', email: 'helen.lin@example.com' },
          parentName: 'Helen Lin',
          parentPhone: '555-0212',
          parentEmail: 'helen.lin@example.com',
          authorizedPickups: ['Helen Lin'],
          isActive: true
        },
        {
          id: '20002',
          schoolId: 'school_dublin_west',
          name: 'Maya Lin',
          fullName: 'Maya Lin',
          parent: { name: 'Helen Lin', phone: '555-0212', email: 'helen.lin@example.com' },
          parentName: 'Helen Lin',
          parentPhone: '555-0212',
          parentEmail: 'helen.lin@example.com',
          authorizedPickups: ['Helen Lin'],
          notes: 'West Campus Student',
          isActive: true
        }
      ];

      const deduped = deduplicateStudents(duplicateNamed as any);
      expect(deduped.length).toBe(1);
      expect(deduped[0].name).toBe('Maya Lin');
    });

    it('guarantees zero duplicate students in Dublin West and across all campuses', () => {
      const campuses = ['school_dublin_east', 'school_dublin_west', 'school_pleasanton', 'school_san_ramon'];

      for (const campusId of campuses) {
        const roster = db.getStudents(campusId);
        expect(roster.length).toBeGreaterThan(0);

        const ids = roster.map(s => s.id);
        const uniqueIds = new Set(ids);
        expect(ids.length).toBe(uniqueIds.size);

        const names = roster.map(s => (s.name || s.fullName || '').toLowerCase().trim());
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
      }
    });

    it('returns exactly 8 students for Dublin West with no duplicates', () => {
      const westStudents = db.getStudents('school_dublin_west');
      expect(westStudents.length).toBe(8);
      const studentIds = westStudents.map(s => s.id);
      expect(studentIds).toEqual(['20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008']);
    });
  });
});
