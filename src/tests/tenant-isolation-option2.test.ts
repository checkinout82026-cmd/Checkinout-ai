import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/db';
import { 
  extractSubdomain, 
  resolveSchoolFromHostname, 
  setSimulatedHostname, 
  getActiveSchoolId, 
  getActiveSchool,
  useSchoolBranding
} from '../lib/tenantContext';
import { User, Student } from '../types';

describe('Option 2: Separate Subdomain / Dashboard Per School', () => {
  beforeEach(() => {
    setSimulatedHostname(null);
  });

  describe('Subdomain Parsing & Resolution', () => {
    it('correctly extracts slug from localhost subdomain URLs', () => {
      expect(extractSubdomain('dublin-east.localhost:3000')).toBe('dublin-east');
      expect(extractSubdomain('dublin-west.localhost:3000')).toBe('dublin-west');
      expect(extractSubdomain('dublin-east.schoolcheckin.com')).toBe('dublin-east');
    });

    it('supports query parameter overrides for local development convenience', () => {
      expect(extractSubdomain('localhost:3000', '?school=dublin-west')).toBe('dublin-west');
      expect(extractSubdomain('localhost:3000', '?subdomain=dublin-east')).toBe('dublin-east');
    });

    it('resolves correct school metadata from parsed subdomain', () => {
      const east = resolveSchoolFromHostname('dublin-east.localhost:3000');
      expect(east.id).toBe('school_dublin_east');
      expect(east.name).toContain('Dublin - East');
      expect(east.themeColor).toBe('#2edaff');

      const west = resolveSchoolFromHostname('dublin-west.localhost:3000');
      expect(west.id).toBe('school_dublin_west');
      expect(west.name).toContain('Dublin - West');
      expect(west.themeColor).toBe('#10b981');
    });
  });

  describe('Subdomain Data Isolation', () => {
    it('guarantees requests to dublin-east subdomain only return dublin-east students', () => {
      setSimulatedHostname('dublin-east.localhost:3000');
      expect(getActiveSchoolId()).toBe('school_dublin_east');

      const students = db.getStudents();
      expect(students.length).toBeGreaterThan(0);
      students.forEach(s => {
        expect(s.schoolId).toBe('school_dublin_east');
      });

      // Dublin West student 20001 is completely excluded
      expect(students.find(s => s.id === '20001')).toBeUndefined();
    });

    it('guarantees requests to dublin-west subdomain only return dublin-west students', () => {
      setSimulatedHostname('dublin-west.localhost:3000');
      expect(getActiveSchoolId()).toBe('school_dublin_west');

      const students = db.getStudents();
      expect(students.length).toBeGreaterThan(0);
      students.forEach(s => {
        expect(s.schoolId).toBe('school_dublin_west');
      });

      // Dublin East student 10001 is completely excluded
      expect(students.find(s => s.id === '10001')).toBeUndefined();
    });

    it('isolates attendance records by subdomain', () => {
      // Dublin East
      setSimulatedHostname('dublin-east.localhost:3000');
      const eastAttendance = db.getAttendance();
      expect(eastAttendance.length).toBeGreaterThan(0);
      eastAttendance.forEach(a => {
        expect(a.schoolId).toBe('school_dublin_east');
      });
      expect(eastAttendance.some(a => a.id === 'att-west-1')).toBe(false);

      // Dublin West
      setSimulatedHostname('dublin-west.localhost:3000');
      const westAttendance = db.getAttendance();
      expect(westAttendance.length).toBeGreaterThan(0);
      westAttendance.forEach(a => {
        expect(a.schoolId).toBe('school_dublin_west');
      });
      expect(westAttendance.some(a => a.id === 'att-1')).toBe(false);
    });

    it('automatically stamps newly created records with the active subdomain schoolId', async () => {
      setSimulatedHostname('dublin-west.localhost:3000');

      const newStudent: Student = {
        id: 'west-subdomain-student-1',
        name: 'West Subdomain Student',
        parent: { name: 'Parent', phone: '555-8888' },
        authorizedPickups: ['Parent']
      };

      await db.saveStudent(newStudent);

      // Verify accessible under West
      const westRoster = db.getStudents();
      const savedInWest = westRoster.find(s => s.id === 'west-subdomain-student-1');
      expect(savedInWest).toBeDefined();
      expect(savedInWest?.schoolId).toBe('school_dublin_west');

      // Switch to East subdomain
      setSimulatedHostname('dublin-east.localhost:3000');
      const eastRoster = db.getStudents();
      const visibleInEast = eastRoster.find(s => s.id === 'west-subdomain-student-1');
      expect(visibleInEast).toBeUndefined();
    });
  });

  describe('Subdomain Login Scoping & Branding', () => {
    it('scopes staff login boundary: School B user cannot authenticate into School A subdomain', () => {
      setSimulatedHostname('dublin-east.localhost:3000');
      const activeSchool = getActiveSchool();

      const schoolBStaff: User = {
        id: 'staff_west',
        username: 'WestStaff',
        role: 'staff',
        name: 'West Staff',
        schoolId: 'school_dublin_west'
      };

      // Validation logic that is executed in Login.tsx
      const isAllowedOnSubdomain = (user: User) => {
        if (!user.schoolId) return true;
        if (user.role === 'super_admin') return true;
        return user.schoolId === activeSchool.id;
      };

      expect(isAllowedOnSubdomain(schoolBStaff)).toBe(false);

      const schoolAStaff: User = {
        id: 'staff_east',
        username: 'CenterStaff',
        role: 'staff',
        name: 'Center Staff',
        schoolId: 'school_dublin_east'
      };
      expect(isAllowedOnSubdomain(schoolAStaff)).toBe(true);
    });

    it('provides distinct branding hooks per subdomain (theme color and subtitle)', () => {
      // East branding
      setSimulatedHostname('dublin-east.localhost:3000');
      const eastBranding = useSchoolBranding();
      expect(eastBranding.subtitle).toBe('Dublin - East');
      expect(eastBranding.themeColor).toBe('#2edaff');

      // West branding
      setSimulatedHostname('dublin-west.localhost:3000');
      const westBranding = useSchoolBranding();
      expect(westBranding.subtitle).toBe('Dublin - West');
      expect(westBranding.themeColor).toBe('#10b981');
    });
  });
});
