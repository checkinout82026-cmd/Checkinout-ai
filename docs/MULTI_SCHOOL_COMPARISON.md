# Multi-School Architecture Comparative Evaluation

This report evaluates the two multi-school architecture options implemented and tested for the Check-In/Out system, following the roadmap in `MULTI_SCHOOL_PLAN.md`.

Both options were built upon the unified base branch (`feature/multi-school-base`) and thoroughly verified through automated tenant isolation test suites.

---

## 1. Executive Summary

| Metric / Dimension | Option 1: User-Scoped Single App (`feature/multi-tenant-single-app`) | Option 2: Subdomain-Per-School (`feature/subdomain-per-school`) |
| :--- | :--- | :--- |
| **Branch** | `feature/multi-tenant-single-app` | `feature/subdomain-per-school` |
| **Tenant Scoping Mechanism** | Authenticated User Session (`user.schoolId`) | Request Hostname / Subdomain (`{slug}.domain.com`) |
| **Lines of Code Changed** | **+378 / -18** across 6 files | **+424 / -23** across 8 files |
| **Test Suite Pass Rate** | **100% (7/7 passing)** | **100% (9/9 passing)** |
| **Infrastructure Overhead** | **None** (Standard single domain & SSL cert) | **Moderate** (Wildcard DNS `*.domain`, Wildcard SSL/TLS) |
| **Local Dev Complexity** | **Zero** (Runs directly on `http://localhost:3000`) | **Low-Moderate** (`?school=` override or `/etc/hosts` mapping) |
| **Multi-School Admin UX** | **Seamless** (In-app school switcher dropdown) | **Segmented** (Requires separate subdomains/browser tabs) |
| **School Custom Branding** | Shared application branding | **Dynamic** (Per-subdomain theme color, subtitle, and badges) |
| **New School Onboarding** | Instant (insert document into `schools` collection) | Instant if wildcard DNS; DNS config if custom domains |

---

## 2. Architecture & Implementation Overview

### Shared Foundation (`feature/multi-school-base`)
Before implementing either option, common multi-school primitives were established:
- **Entities**: Created `School` entity (`id`, `name`, `slug`, `themeColor`, `subtitle`, `isActive`, `createdAt`) and added `schoolId` foreign key to `User`, `Student`, `AttendanceRecord`, and `AuthorizedPickupPerson`.
- **Database Enforcement**: Refactored `src/lib/db.ts` to automatically filter every student, attendance log, and pickup query by `schoolId`. Write operations (`saveStudent`, `addAttendanceRecord`) strictly validate and stamp `schoolId`.
- **Firestore Security Rules**: Rules require `request.auth.token.schoolId == resource.data.schoolId` on all tenant-specific documents.
- **Seed Data**: Pre-populated datasets for **Dublin East Campus** (`school_dublin_east`) and **Dublin West Campus** (`school_dublin_west`).

---

### Option 1: Multi-School Within Single Application (`feature/multi-tenant-single-app`)

#### Implementation Mechanics
- **Tenant Context**: Defined in `src/lib/tenantContext.ts`. Tenant context is initialized upon login from the authenticated user's profile (`user.schoolId`).
- **Data Scoping**: When a staff member logs in, `setSessionTenant(user.schoolId)` locks all application queries to their school.
- **Super-Admin Switcher**: Users with the `super-admin` role can switch active school context via an interactive dropdown in the top navigation bar (`DashboardLayout.tsx`), triggering immediate UI reload for the target school.
- **Files Touched**:
  - `src/App.tsx` (Session tenant synchronization)
  - `src/components/DashboardLayout.tsx` (Super-admin school switcher)
  - `src/lib/tenantContext.ts` (Active tenant resolver and session state)
  - `src/tests/setup.ts` & `src/tests/tenant-isolation-option1.test.ts` (7 isolation tests)
  - `vitest.config.ts`

#### Test Results (`npm test`)
```
✓ Option 1: Multi-School Single Application (User-Scoped) (7 tests)
  ✓ sets and verifies active session tenant
  ✓ guarantees queries scoped to Dublin East never return Dublin West students
  ✓ guarantees queries scoped to Dublin West never return Dublin East students
  ✓ isolates attendance log records between schools
  ✓ prevents direct student record access across tenants even if ID is known
  ✓ ignores tampering attempts where client passes mismatched schoolId during writes
  ✓ allows super-admin to switch active tenant context and see respective datasets
```

---

### Option 2: Separate Subdomain Per School (`feature/subdomain-per-school`)

#### Implementation Mechanics
- **Tenant Context**: Defined in `src/lib/tenantContext.ts`. The school is resolved by parsing `window.location.hostname` (e.g. `dublin-east.localhost` -> slug `dublin-east` -> `school_dublin_east`).
- **Dev Convenience Fallback**: Supports `?school=dublin-west` query parameter overrides so developers do not need to modify `/etc/hosts` for basic local testing.
- **Strict Login Scoping**: In `src/components/Login.tsx`, staff login attempts are validated against the subdomain tenant. If a Dublin West user attempts to authenticate on `dublin-east.localhost`, login is rejected with:
  > *"This account belongs to Dublin West Campus. Please log in at dublin-west.localhost"*
- **Dynamic Branding**: Created `useSchoolBranding()` hook. The navigation bar dynamically adapts to the school's theme color (e.g. emerald green for East, indigo for West) and displays the campus subtitle and school badge.
- **Files Touched**:
  - `README.md` (Local dev subdomain documentation)
  - `src/App.tsx` (Subdomain branding and tenant state)
  - `src/components/DashboardLayout.tsx` (Branded navigation bar & campus badges)
  - `src/components/Login.tsx` (Subdomain login boundary enforcement)
  - `src/lib/tenantContext.ts` (Subdomain extraction & resolution)
  - `src/tests/setup.ts` & `src/tests/tenant-isolation-option2.test.ts` (9 isolation tests)
  - `vitest.config.ts`

#### Test Results (`npm test`)
```
✓ Option 2: Separate Subdomain / Dashboard Per School (9 tests)
  ✓ Subdomain Parsing & Resolution
    ✓ correctly extracts slug from localhost subdomain URLs
    ✓ supports query parameter overrides for local development convenience
    ✓ resolves correct school metadata from parsed subdomain
  ✓ Subdomain Data Isolation
    ✓ guarantees requests to dublin-east subdomain only return dublin-east students
    ✓ guarantees requests to dublin-west subdomain only return dublin-west students
    ✓ isolates attendance records by subdomain
    ✓ automatically stamps newly created records with the active subdomain schoolId
  ✓ Subdomain Login Scoping & Branding
    ✓ scopes staff login boundary: School B user cannot authenticate into School A subdomain
    ✓ provides distinct branding hooks per subdomain (theme color and subtitle)
```

---

## 3. Deep-Dive Comparative Analysis

### A. Infrastructure & DevOps Requirements
- **Option 1**:
  - Deployable to any standard static SPA host (Firebase Hosting, Vercel, Netlify, Cloudflare Pages).
  - Uses a single apex domain or subdomain (e.g. `checkin.communityschools.org`).
  - Single standard SSL certificate.
  - No custom DNS management when adding schools.
- **Option 2**:
  - Requires **Wildcard DNS** (`*.checkin.communityschools.org` -> CNAME to hosting provider).
  - Requires **Wildcard SSL / TLS certificate** (via Let's Encrypt DNS-01 challenge or AWS ACM / Cloudflare Managed SSL).
  - If external schools bring custom domains (e.g. `checkin.dublineast.edu`), requires an automated custom domain provisioning pipeline (e.g., Cloudflare for SaaS or Caddy on-demand TLS).

### B. Local Development & Operational Friction
- **Option 1**:
  - Developers run `npm run dev` and navigate to `http://localhost:3000`.
  - Switching between schools is instant via the super-admin dropdown.
  - Zero browser cookie/storage isolation concerns.
- **Option 2**:
  - Developers must test subdomain routing. While query parameters (`?school=dublin-west`) alleviate this for basic tests, verifying cookie domains and browser origin isolation requires `/etc/hosts` entries (`127.0.0.1 dublin-east.localhost`).
  - Auth sessions in `localStorage` are shared across subdomains under `localhost`, but on production subdomains (`dublin-east.example.com` vs `dublin-west.example.com`), sessions are isolated by browser origin policy unless cookie sharing is configured.

### C. Security & Data Leakage Defense
Both options provide defense-in-depth against data leakage, but operate at different boundaries:
- **Option 1**:
  - Relies on **User Profile + Firestore Rules**.
  - Staff credentials determine which records can be queried.
  - *Risk vector*: If a staff member is accidentally assigned the wrong `schoolId` in Firestore, they see that school's data.
- **Option 2**:
  - Adds a **Network / Hostname Perimeter**.
  - Login is rejected *before* authentication completes if the user does not belong to the subdomain.
  - An unauthorized user cannot even reach the dashboard of another school.
  - Provides natural rate-limiting and access restriction per subdomain.

### D. User Experience & Organizational Fit
- **Option 1** is ideal for:
  - Multi-campus networks where district-level supervisors oversee 5–50 schools and need to toggle between them quickly.
  - Organizations with unified branding across all locations.
- **Option 2** is ideal for:
  - White-label commercial SaaS where each school is an independent paying customer.
  - Schools demanding their own branded portal, custom colors, logos, and dedicated URLs.

---

## 4. Final Recommendation & Implementation Strategy

### Strategic Recommendation: **Two-Stage Hybrid Adoption**

1. **Deploy Option 1 First (Phase 1 Target)**:
   - For immediate rollout across the initial schools (Dublin East and Dublin West), **Option 1 (`feature/multi-tenant-single-app`)** is recommended.
   - It introduces zero additional infrastructure dependencies, requires no DNS/SSL changes, allows district administrators to seamlessly switch between campuses, and reduces testing/maintenance overhead.

2. **Transition to Option 2 When White-Labeling Is Contracted (Phase 2 Target)**:
   - Because both branches share the exact same underlying `feature/multi-school-base` architecture (`schoolId` on all entities and query constraints), transitioning to **Option 2 (`feature/subdomain-per-school`)** requires only applying the routing middleware in `src/lib/tenantContext.ts` and the login boundary check in `src/components/Login.tsx`.
   - Option 2 is ready in branch `feature/subdomain-per-school` whenever wildcard DNS and institutional branding are prioritized.
