# Multi-Region Route-Based & Dedicated Table Architecture

## 1. Executive Summary

This document provides a high-level overview of the multi-region architecture implemented on the `feature/subdomain-per-school` branch.

It delivers:
1. **Physical database table separation per region** for students and attendance records.
2. **A single mixed staff/admin table (`users`)** for zero-overhead, instant $O(1)$ authentication.
3. **A clean route-based URL structure** (`/:schoolSlug/dashboard`, `/:schoolSlug/kiosk`).
4. **A global login screen (`/login`)** with zero school selectors.
5. **100% backward compatibility for Dublin East and the `master` / `main` production branch**.
6. **Automatic Staff & Student Deduplication Engines** to guarantee zero duplicate entries across UI views and database sync.

---

## 2. High-Level Architecture Diagram

```
                                  [ Global User Entry ]
                                             │
                        ┌────────────────────┴────────────────────┐
                        ▼                                         ▼
            [ Global Login: /login ]                 [ Kiosk: /:schoolSlug/kiosk ]
                        │                                         │
        (1 Single Lookup on `users` Table)            (Directly scoped to that school)
                        │                                         │
                        ▼                                         ▼
              Auto-Route to Assigned                   Students enter 4-5 digit PIN
            [ /:schoolSlug/dashboard ]                 queries only that school's table
                        │
                        ▼
            ┌───────────────────────────────────────────────┐
            │             Database Routing Layer            │
            └───────┬──────────────┬──────────────┬─────────┘
                    │              │              │
                    ▼              ▼              ▼
           Dublin East (Real)  Dublin West   Pleasanton & San Ramon
              `students`        `students_    `students_pleasanton`
             `attendance`      dublin_west`   `students_san_ramon`
           (Master branch safe)
```

---

## 3. Database Table Structure

### A. Central Staff & Admin Table (`users`)
All administrators and center staff from **all regions** are stored in a single, top-level `users` collection:

| Field | Example Value | Description |
| :--- | :--- | :--- |
| `id` | `admin_pleasantonadmin` | Unique document ID |
| `username` | `PleasantonAdmin` | Case-insensitive login identifier |
| `email` | `pleasantonadmin@school.org` | Primary email |
| `role` | `admin` \| `staff` \| `super_admin` | Access role |
| `schoolId` | `school_pleasanton` | Assigned region (`undefined` for `super_admin`) |

#### Why this is optimal:
- **Instant Authentication**: Staff enter their username/password; the database resolves their account in **1 single read** ($O(1)$).
- **No Multi-Table Guessing**: The system never has to scan multiple tables to determine which school the user belongs to.
- **SuperAdmin Support**: Central administrators can access any campus dashboard from a single account.
- **Strict School-Scoped Management**:
  - In **Manage Staff & Admins**, center administrators only see and manage staff members of **their own school/region**. They cannot see or modify staff from other centers or central `super_admin` accounts.
  - In **Attendance** records and student pickup approval modals, staff selector dropdowns are strictly isolated to the active campus.
  - New staff accounts created by an admin are automatically bound to that admin's `schoolId`.
  - Campus admins are protected against accidental lockout (an admin cannot delete the sole remaining administrator for their campus).
  - Central `super_admin` accounts have a multi-campus filter to review and manage accounts across all campuses or by individual center.
- **Staff Deduplication Engine (`deduplicateUsers`)**:
  - Automatically merges Firebase Auth UID records with fallback/seed records by normalized username/email.
  - Guarantees zero double entries in the Manage Staff UI.
  - Both `main` and `feature/subdomain-per-school` branches are guarded: `main` only auto-provisions Dublin East accounts, preventing cross-branch resurrection of Dublin West accounts in Firestore.

### B. Dedicated Regional Student & Attendance Tables
Rather than mixing all students into one table with a filter, each non-default region has its own physically distinct collection in Cloud Firestore:

| Region | Slug | Students Collection | Attendance Collection | Pickups Collection |
| :--- | :--- | :--- | :--- | :--- |
| **Dublin East (Real Users)** | `dublin-east` | **`students`** | **`attendance`** | **`authorized_pickups`** |
| **Dublin West (Demo)** | `dublin-west` | `students_dublin_west` | `attendance_dublin_west` | `authorized_pickups_dublin_west` |
| **Pleasanton (Demo)** | `pleasanton` | `students_pleasanton` | `attendance_pleasanton` | `authorized_pickups_pleasanton` |
| **San Ramon (Demo)** | `san-ramon` | `students_san_ramon` | `attendance_san_ramon` | `authorized_pickups_san_ramon` |

> [!IMPORTANT]
> **Backward Compatibility & Resilient Fallback:**
> 1. Dublin East maps to root `students` and `attendance` collections, ensuring the production `master` / `main` branch remains 100% operational.
> 2. In `src/lib/db.ts`, if regional collections encounter permissions constraints prior to cloud rule deployment, the system automatically falls back to querying and persisting through root collections filtered by `schoolId`.
> 3. Security rules in `firestore.rules` are configured to permit both root and regional collections (`students_*`, `attendance_*`, `authorized_pickups_*`).

### C. Student Deduplication Engine (`deduplicateStudents`)
- Normalizes student IDs and deduplicates records across state, `localStorage`, and Firestore subscriptions.
- Consolidates duplicate records while preserving the most complete data (authorized pickup details, parent contact, notes).
- Secondary deduplication consolidates any duplicate roster CSV imports with identical student names within the same school.
- `<AdminStudents school={matchedSchool} />` strictly receives its campus context and renders `displayedStudents = deduplicateStudents(students)`, ensuring zero duplicate rows in Manage Students.

---

## 4. Route-Based Navigation Structure

The application routes views using clean, bookmarkable URL paths:

### 1. Global Login (`/login`)
- **Purpose**: Clean, generic Kumon login screen without campus selectors or school switchers.
- **Workflow**:
  1. User enters their username and password.
  2. The system checks the central `users` table and authenticates the user.
  3. The system reads the user's `schoolId` and automatically redirects them to:
     `/${user.schoolSlug}/dashboard` (or `/${user.schoolSlug}/kiosk`).

### 2. Management Dashboard (`/:schoolSlug/dashboard`)
- **Examples**: `/dublin-east/dashboard`, `/pleasanton/dashboard`, `/san-ramon/dashboard`.
- **Security Guard**:
  - If unauthenticated: Redirects to `/login`.
  - If authenticated with a different campus: Shows an **Access Restricted** screen with a 1-click button: *"Go to My School Dashboard"*.
  - If `super_admin`: Displays a **Campus Switcher** dropdown in the sidebar to jump between all 4 centers effortlessly.

### 3. Dedicated Student Kiosk (`/:schoolSlug/kiosk`)
- **Examples**: `/dublin-east/kiosk`, `/dublin-west/kiosk`, `/pleasanton/kiosk`.
- **Purpose**: Dedicated check-in tablet at the center lobby.
- **How it solves the Kiosk dilemma**:
  - The front-desk iPad at Pleasanton simply opens `app.com/pleasanton/kiosk`.
  - **Parents and students never see a school picker**.
  - Student PIN lookups and check-ins execute strictly against `students_pleasanton` and `attendance_pleasanton`.

---

## 5. Same Layout, Custom Branding & Features

All school portals share the unified, battle-tested UI layout, but are dynamically styled and branded based on the active route:

| Region | Theme Color | Brand Subtitle | Address & Phone |
| :--- | :--- | :--- | :--- |
| **Dublin East** | Kumon Cyan (`#2edaff`) | Dublin - East | 7032 Dublin Blvd, Dublin, CA \| (925) 829-1000 |
| **Dublin West** | Emerald (`#10b981`) | Dublin - West | 4288 Dublin Blvd Ste 110, Dublin, CA \| (925) 829-2000 |
| **Pleasanton** | Indigo (`#6366f1`) | Pleasanton | 6601 Owens Dr, Pleasanton, CA \| (925) 463-1000 |
| **San Ramon** | Amber (`#f59e0b`) | San Ramon | 2435 San Ramon Valley Blvd, San Ramon, CA \| (925) 830-1000 |

---

## 6. Pre-Configured Test Credentials

| Region | Username | Role | Password | Landing Route | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dublin East** | **`Sanjay`** | Admin | `Oh43016` | **`/dublin-east/dashboard`** | Restored strictly to Dublin East |
| **Dublin East** | `Ajita` | Admin | `Oh43016` | `/dublin-east/dashboard` | Dublin East Administrator |
| **Dublin East** | `CenterStaff` | Staff | `Oh43017` | `/dublin-east/dashboard` | Dublin East Staff Member |
| **Dublin West** | **`WestAdmin`** | Admin | `Oh43016` | **`/dublin-west/dashboard`** | Dublin West Administrator |
| **Dublin West** | `WestStaff` | Staff | `Oh43017` | `/dublin-west/dashboard` | Dublin West Staff Member |
| **Pleasanton** | `PleasantonAdmin` | Admin | `Oh43016` | `/pleasanton/dashboard` | Pleasanton Administrator |
| **Pleasanton** | `PleasantonStaff` | Staff | `Oh43017` | `/pleasanton/dashboard` | Pleasanton Staff Member |
| **San Ramon** | `SanRamonAdmin` | Admin | `Oh43016` | `/san-ramon/dashboard` | San Ramon Administrator |
| **San Ramon** | `SanRamonStaff` | Staff | `Oh43017` | `/san-ramon/dashboard` | San Ramon Staff Member |
| **SuperAdmin** | `SuperAdmin` | SuperAdmin | `Oh43016` | All Regions | Full multi-campus switcher access |

---

## 7. Automated Test & Build Verification

All **41 unit and integration tests** pass cleanly:
- **`src/tests/route-and-table-architecture.test.ts`**: 26 passed (100%)
  - Database table/collection resolution (2 tests)
  - Route-based path parsing (4 tests)
  - Multi-region data isolation (3 tests)
  - Global login authentication & route authorization (4 tests)
  - Manage staff school-scoping & admin isolation (9 tests)
  - Student deduplication & roster isolation (4 tests)
- **`src/tests/tenant-isolation-option2.test.ts`**: 15 passed (100%)
- **TypeScript Typecheck (`npm run lint` / `tsc --noEmit`)**: 0 errors
- **Production Build (`npm run build`)**: Success in 5.39s

---

## 8. Database Environments & Complete Data Migration

To protect live production operations from experimentation and multi-tenant feature testing, Firestore database instances are isolated per branch:

| Branch | Environment | Firestore Database Instance ID | Status |
| :--- | :--- | :--- | :--- |
| **`main` / `master`** | **Production** | `ai-studio-remixremixchecki-4141448b-e367-448b-97a3-dc964e7f7642` | **Active Production** (Untouched) |
| **`feature/subdomain-per-school`** | **Staging / Testing** | `ai-studio-firebaseapp-a7ffb7a2-6271-4f4f-9948-16aed4b8ac1e` | **Complete Migration** (469 Docs Verified) |

### Migration Verification Summary
- **Collection `users`**: 16 documents (100% verified match)
- **Collection `students`**: 121 documents (100% verified match)
- **Collection `attendance`**: 108 documents (100% verified match)
- **Collection `authorized_pickups`**: 224 documents (100% verified match)
- **Total Records Migrated**: **469 / 469 documents**
- **Deep Hash & Field Check**: 0 discrepancies, all keys and types preserved.

