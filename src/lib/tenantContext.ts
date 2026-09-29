import { School, User } from '../types';

export const SEED_SCHOOLS: School[] = [
  {
    id: 'school_dublin_east',
    name: 'Kumon Math & Reading Center of Dublin - East',
    slug: 'dublin-east',
    subtitle: 'Dublin - East',
    themeColor: '#2edaff',
    logoUrl: '/kumon_logo.webp',
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
    logoUrl: '/kumon_logo.webp',
    address: '4288 Dublin Blvd Ste 110, Dublin, CA 94568',
    phone: '(925) 829-2000',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const DEFAULT_SCHOOL_ID = 'school_dublin_east';

let simulatedHostname: string | null = null;
let simulatedSearch: string | null = null;

export function setSimulatedHostname(hostname: string | null, search: string | null = null): void {
  simulatedHostname = hostname;
  simulatedSearch = search;
}

/**
 * Extracts the tenant slug from the hostname or search params.
 * e.g. dublin-east.localhost:3000 -> "dublin-east"
 *      dublin-west.schoolapp.com -> "dublin-west"
 *      localhost:3000?school=dublin-west -> "dublin-west"
 */
export function extractSubdomain(hostname: string, search = ''): string | null {
  // Query param takes priority during dev or testing
  if (search) {
    const params = new URLSearchParams(search);
    const paramSchool = params.get('school') || params.get('subdomain');
    if (paramSchool) return paramSchool.toLowerCase();
  }

  const cleanHost = hostname.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // e.g. dublin-east.localhost or dublin-east.example.com
  if (parts.length >= 2) {
    const candidate = parts[0];
    if (candidate !== 'www' && candidate !== 'localhost' && candidate !== '127') {
      return candidate;
    }
  }

  return null;
}

export const REMEMBERED_SCHOOL_KEY = 'checkin_selected_school';

let memoryRememberedSchool: string | null = null;

export function hasExplicitSubdomain(hostname?: string, search?: string): boolean {
  const host = hostname ?? simulatedHostname ?? (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
  const searchStr = search ?? simulatedSearch ?? (typeof window !== 'undefined' ? window.location.search : '');
  const slug = extractSubdomain(host, searchStr);
  if (!slug) return false;
  return getSchoolBySlug(slug) !== undefined;
}

export function getRememberedSchoolSlug(): string | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(REMEMBERED_SCHOOL_KEY);
      if (stored) return stored;
    } catch {}
  }
  return memoryRememberedSchool;
}

export function setRememberedSchoolSlug(slug: string): void {
  memoryRememberedSchool = slug;
  if (typeof window !== 'undefined') {
    try {
      if (typeof window.localStorage !== 'undefined') {
        localStorage.setItem(REMEMBERED_SCHOOL_KEY, slug);
      }
      window.dispatchEvent(new CustomEvent('school_changed', { detail: slug }));
    } catch {}
  }
}

export function clearRememberedSchool(): void {
  memoryRememberedSchool = null;
  if (typeof window !== 'undefined') {
    try {
      if (typeof window.localStorage !== 'undefined') {
        localStorage.removeItem(REMEMBERED_SCHOOL_KEY);
      }
      window.dispatchEvent(new CustomEvent('school_changed', { detail: null }));
    } catch {}
  }
}

export function isSchoolSelectionRequired(hostname?: string, search?: string): boolean {
  // If an explicit subdomain or query param exists (e.g. ?school=dublin-west), no modal is needed
  if (hasExplicitSubdomain(hostname, search)) return false;

  // If a valid school has already been remembered on this device, no modal is needed
  const remembered = getRememberedSchoolSlug();
  if (remembered && getSchoolBySlug(remembered)) return false;

  return true;
}

/**
 * Resolves the School based on the request's subdomain or remembered selection.
 */
export function resolveSchoolFromHostname(hostname?: string, search?: string): School {
  const host = hostname ?? simulatedHostname ?? (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
  const searchStr = search ?? simulatedSearch ?? (typeof window !== 'undefined' ? window.location.search : '');

  // 1. Explicit subdomain or query param takes highest precedence
  const slug = extractSubdomain(host, searchStr);
  if (slug) {
    const matched = getSchoolBySlug(slug);
    if (matched) return matched;
  }

  // 2. Remembered school selection in localStorage (e.g. for Render bare domains)
  const remembered = getRememberedSchoolSlug();
  if (remembered) {
    const matched = getSchoolBySlug(remembered);
    if (matched) return matched;
  }

  // 3. Fallback to default school
  return SEED_SCHOOLS[0];
}

export function getActiveSchool(): School {
  return resolveSchoolFromHostname();
}

export function getActiveSchoolId(): string {
  return getActiveSchool().id;
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

/**
 * Branding hook for Option 2:
 * Provides the active school's brand assets dynamically by subdomain or remembered selection.
 */
export function useSchoolBranding() {
  const school = getActiveSchool();
  return {
    school,
    name: school.name,
    subtitle: school.subtitle || school.name,
    themeColor: school.themeColor || '#2edaff',
    logoUrl: school.logoUrl || '/kumon_logo.webp',
    isExplicitSubdomain: hasExplicitSubdomain()
  };
}
