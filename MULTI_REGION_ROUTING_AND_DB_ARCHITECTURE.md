# Multi-Region Route-Based & Dedicated Table Architecture

## 1. Executive Summary

This document provides a high-level overview of the multi-region architecture implemented on the `feature/subdomain-per-school` branch.

It delivers:
1. **Physical database table separation per region** for students and attendance records.
2. **A single mixed staff/admin table (`users`)** for zero-overhead, instant $O(1)$ authentication.
3. **A clean route-based URL structure** (`/:schoolSlug/dashboard`, `/:schoolSlug/kiosk`).
4. **A global login screen (`/login`)** with zero school selectors.
5. **100% backward compatibility for Dublin East and the `master` / `main` production branch**.

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

### B. Dedicated Regional Student & Attendance Tables
Rather than mixing all students into one table with a filter, each non-default region has its own physically distinct collection in Cloud Firestore:

| Region | Slug | Students Collection | Attendance Collection | Pickups Collection |
| :--- | :--- | :--- | :--- | :--- |
| **Dublin East (Real Users)** | `dublin-east` | **`students`** | **`attendance`** | **`authorized_pickups`** |
| **Dublin West (Demo)** | `dublin-west` | `students_dublin_west` | `attendance_dublin_west` | `authorized_pickups_dublin_west` |
| **Pleasanton (Demo)** | `pleasanton` | `students_pleasanton` | `attendance_pleasanton` | `authorized_pickups_pleasanton` |
| **San Ramon (Demo)** | `san-ramon` | `students_san_ramon` | `attendance_san_ramon` | `authorized_pickups_san_ramon` |

> [!IMPORTANT]
> **Why Dublin East uses `students` directly:**
> The live production deployment on the `master` / `main` branch reads and writes to `students` and `attendance`. Keeping Dublin East mapped to these root collections guarantees that the `master` branch continues to work smoothly without breaking or requiring a database migration.

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

| Region | Username | Role | Password | Landing Route |
| :--- | :--- | :--- | :--- | :--- |
| **Dublin East** | `Ajita` | Admin | `Oh43016` | `/dublin-east/dashboard` |
| **Dublin East** | `CenterStaff` | Staff | `Oh43017` | `/dublin-east/dashboard` |
| **Dublin West** | `Sanjay` | Admin | `Oh43016` | `/dublin-west/dashboard` |
| **Dublin West** | `WestStaff` | Staff | `Oh43017` | `/dublin-west/dashboard` |
| **Pleasanton** | `PleasantonAdmin` | Admin | `Oh43016` | `/pleasanton/dashboard` |
| **Pleasanton** | `PleasantonStaff` | Staff | `Oh43017` | `/pleasanton/dashboard` |
| **San Ramon** | `SanRamonAdmin` | Admin | `Oh43016` | `/san-ramon/dashboard` |
| **San Ramon** | `SanRamonStaff` | Staff | `Oh43017` | `/san-ramon/dashboard` |
| **SuperAdmin** | `SuperAdmin` | SuperAdmin | `Oh43016` | Can switch to any region |

---

## 7. Automated Test & Build Verification

All 28 unit and integration tests pass cleanly:
- **`src/tests/route-and-table-architecture.test.ts`**: 13 passed (100%)
- **`src/tests/tenant-isolation-option2.test.ts`**: 15 passed (100%)
- **TypeScript Typecheck (`npm run lint`)**: 0 errors
- **Production Build (`npm run build`)**: Success in 5.38s
