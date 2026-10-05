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
  },
  {
    id: 'school_pleasanton',
    name: 'Kumon Math & Reading Center of Pleasanton',
    slug: 'pleasanton',
    subtitle: 'Pleasanton',
    themeColor: '#6366f1',
    logoUrl: '/kumon_logo.webp',
    address: '6601 Owens Dr, Pleasanton, CA 94588',
    phone: '(925) 463-1000',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'school_san_ramon',
    name: 'Kumon Math & Reading Center of San Ramon',
    slug: 'san-ramon',
    subtitle: 'San Ramon',
    themeColor: '#f59e0b',
    logoUrl: '/kumon_logo.webp',
    address: '2435 San Ramon Valley Blvd, San Ramon, CA 94583',
    phone: '(925) 830-1000',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const DEFAULT_SCHOOL_ID = 'school_dublin_east';

let simulatedHostname: string | null = null;
let simulatedSearch: string | null = null;
let simulatedPathname: string | null = null;

export function setSimulatedLocation(options: { hostname?: string | null; search?: string | null; pathname?: string | null }): void {
  if (options.hostname !== undefined) simulatedHostname = options.hostname;
  if (options.search !== undefined) simulatedSearch = options.search;
  if (options.pathname !== undefined) simulatedPathname = options.pathname;
}

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

export function extractSlugFromPath(pathname?: string): string | null {
  const path = pathname ?? simulatedPathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (!clean) return null;
  const firstSegment = clean.split('/')[0].toLowerCase();
  if (firstSegment === 'login' || firstSegment === 'api' || firstSegment === 'assets') {
    return null;
  }
  const matched = getSchoolBySlug(firstSegment);
  return matched ? matched.slug : null;
}

export interface AppRoute {
  type: 'login' | 'school' | 'root';
  schoolSlug?: string;
  view?: 'dashboard' | 'kiosk';
}

export function parseAppRoute(pathname?: string): AppRoute {
  const path = pathname ?? simulatedPathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (!clean) return { type: 'root' };
  
  const segments = clean.split('/');
  const first = segments[0].toLowerCase();
  if (first === 'login') {
    return { type: 'login' };
  }
  
  const school = getSchoolBySlug(first);
  if (school) {
    const second = segments[1]?.toLowerCase();
    const view = second === 'kiosk' ? 'kiosk' : 'dashboard';
    return { type: 'school', schoolSlug: school.slug, view };
  }
  
  return { type: 'root' };
}

export function navigateTo(path: string): void {
  if (typeof window !== 'undefined' && window.history) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  }
}

/**
 * Resolves the School based on route path, subdomain, query params, or remembered selection.
 */
export function resolveSchoolFromHostname(hostname?: string, search?: string, pathname?: string): School {
  // 1. Path-based route (e.g. /dublin-west/dashboard or /pleasanton/kiosk) takes #1 precedence
  const pathSlug = extractSlugFromPath(pathname);
  if (pathSlug) {
    const matched = getSchoolBySlug(pathSlug);
    if (matched) return matched;
  }

  const host = hostname ?? simulatedHostname ?? (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
  const searchStr = search ?? simulatedSearch ?? (typeof window !== 'undefined' ? window.location.search : '');

  // 2. Explicit subdomain or query param takes second precedence
  const slug = extractSubdomain(host, searchStr);
  if (slug) {
    const matched = getSchoolBySlug(slug);
    if (matched) return matched;
  }

  // 3. Remembered school selection in localStorage (e.g. for Render bare domains)
  const remembered = getRememberedSchoolSlug();
  if (remembered) {
    const matched = getSchoolBySlug(remembered);
    if (matched) return matched;
  }

  // 4. Fallback to default school (Dublin East)
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
 * Verifies whether a user is authorized to access a given school/campus portal.
 * Super admins can access any school. Unscoped accounts (if any) can access for backwards compatibility.
 * Campus-scoped staff and admins are strictly locked to their assigned school.
 */
export function isUserAuthorizedForSchool(user: { schoolId?: string; role?: string } | null | undefined, schoolId: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (!user.schoolId) return true;
  return user.schoolId === schoolId;
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
