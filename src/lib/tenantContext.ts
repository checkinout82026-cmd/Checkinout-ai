import { School } from '../types';

export const SEED_SCHOOLS: School[] = [
  {
    id: 'school_dublin_east',
    name: 'Kumon Math & Reading Center of Dublin - East',
    slug: 'dublin-east',
    subtitle: 'Dublin - East',
    themeColor: '#2edaff',
    address: '7032 Dublin Blvd, Dublin, CA 94568',
    phone: '(925) 829-1000',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'school_dublin_west',
    name: 'Kumon Math & Reading Center of Dublin - West',
    slug: 'dublin-west',
    subtitle: 'Dublin - West',
    themeColor: '#10b981',
    address: '4288 Dublin Blvd Ste 110, Dublin, CA 94568',
    phone: '(925) 829-2000',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const DEFAULT_SCHOOL_ID = 'school_dublin_east';

let currentActiveSchoolId: string = DEFAULT_SCHOOL_ID;

/**
 * Shared tenant context resolver.
 * Base branch stubs resolution to DEFAULT_SCHOOL_ID (School A).
 * Experiment branches override/extend this behavior.
 */
export function getActiveSchoolId(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('activeSchoolId');
    if (override) return override;
  }
  return currentActiveSchoolId;
}

export function setActiveSchoolId(schoolId: string): void {
  currentActiveSchoolId = schoolId;
  if (typeof window !== 'undefined') {
    localStorage.setItem('activeSchoolId', schoolId);
  }
}

export function getAllSchools(): School[] {
  return SEED_SCHOOLS;
}

export function getSchoolById(id?: string): School | undefined {
  if (!id) return undefined;
  return SEED_SCHOOLS.find(s => s.id === id);
}

export function getSchoolBySlug(slug?: string): School | undefined {
  if (!slug) return undefined;
  return SEED_SCHOOLS.find(s => s.slug.toLowerCase() === slug.toLowerCase());
}
