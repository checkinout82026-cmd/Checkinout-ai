# Security Remediation Log

This document records all security fixes, refactoring, and hardening changes applied to the Student Check-In / Check-Out system.

---

## Remediation Progress Summary

| Issue ID | Category | Description | Status | Commit / Date |
| :--- | :--- | :--- | :--- | :--- |
| **C1 / C2** | CRITICAL | Remove hardcoded plaintext credentials and universal password backdoors | **RESOLVED** | 2026-09-01 |
| **C4** | CRITICAL | Purge real minor/family PII from repository and provide synthetic seed data | **RESOLVED** | 2026-09-01 |
| **C5** | CRITICAL | Eliminate plaintext password storage in Firestore and client `localStorage` | **RESOLVED** | 2026-09-01 |
| **H1 / H2** | HIGH | Enforce strict Firebase Auth and secure role assignment | **RESOLVED** | 2026-09-01 |
| **C6 / H3** | CRITICAL / HIGH | Require real verification in Staff Approval modal for student checkout | **RESOLVED** | 2026-09-01 |
| **H5** | HIGH | Remove destructive auto-seeding logic and protect maintenance scripts | **RESOLVED** | 2026-09-01 |
| **C3** | CRITICAL | Harden Firestore security rules with authenticated least-privilege policies | In Progress | 2026-09-01 |
| **H4** | HIGH | Clarify simulated SMS notification status and state handling | Pending | — |
| **H6 / M / L** | HIGH / MED / LOW | Kiosk session hardening, input sanitization, dependency and config cleanup | Pending | — |

---

## Detailed Remediation Entries

### [C1 / C2] Remove Hardcoded Credentials and Universal Password Backdoors

- **Issue Classification:** CRITICAL (C1: Hardcoded credentials in repo, C2: Universal backdoor password)
- **Date:** 2026-09-01
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. Plaintext admin password `Giridharan#20` and staff password `Password123!` hardcoded in `src/lib/db.ts` and `src/lib/auth.ts`.
  2. Master bypass check in `src/lib/auth.ts` allowing login with `Giridharan#20` regardless of stored password.
  3. Universal backdoor allowing any account to log in with `password === 'password'`.
  4. Blank password fields automatically defaulting to `'password'` in `src/lib/db.ts` and `src/components/AdminStaff.tsx`.
- **Changes Applied:**
  - `src/lib/auth.ts`: Removed hardcoded master-key checks (`Giridharan#20`) and universal fallback `password === 'password'`. Authentication now strictly compares valid credentials (`Boolean(match.password && match.password === password)`).
  - `src/lib/db.ts`: Removed hardcoded personal admin credentials (`KeshavKousik` / `Giridharan#20`) and staff credentials (`Password123!`). Replaced default template accounts with sanitized demo credentials (`smith.admin` and `adams.staff`) documented in `docs/08-CREDENTIALS.md`. Removed `admin_keshav` resurrection logic. Removed default fallback `|| 'password'` in `saveUsers` and `saveUser`.
  - `src/components/AdminStaff.tsx`: Removed fallback to `'password'` when creating or editing staff/admin accounts. Added validation requiring a minimum 6-character password on user creation.
- **Verification & Testing:**
  - Tested build with `bun run lint` and `bun run build` (both succeeded with 0 errors).
  - Verified no occurrences of `Giridharan#20` remain in source code.
  - Verified no occurrences of backdoor fallback `password === 'password'` remain in source code.

---

### [C4] Purge Real Student/Family PII and Provide Synthetic Seed Data

- **Issue Classification:** CRITICAL (C4: Real PII of minors committed to source control)
- **Date:** 2026-09-01
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. `actual_students.csv` contained 103 real children names, student IDs, parent phone numbers, and family contact records.
  2. `src/lib/seedData.ts` contained 3,540 lines of hardcoded real student PII that was being auto-seeded into Firestore.
- **Changes Applied:**
  - `actual_students.csv`: Replaced with 10 synthetic student records using fictitious names (e.g. "Alex Morgan", "Emma Johnson") and reserved dummy telephone numbers (`555-01xx`).
  - `src/lib/seedData.ts`: Replaced 3,540 lines of real PII with `SYNTHETIC_STUDENTS`, providing mock student profiles and sample attendance entries without any actual PII.
  - Provided guidance for repository owners on cleaning historical commits using `git-filter-repo` when ready for git history cleanup.
- **Verification & Testing:**
  - Verified with global pattern search across the workspace that all real student names and phone numbers have been purged from source files.
  - Ran `bun run lint` and `bun run build` to ensure type integrity and schema compatibility across all views.

---

### [C5] Eliminate Plaintext Password Storage in Firestore and LocalStorage

- **Issue Classification:** CRITICAL (C5: Plaintext passwords stored and synced everywhere)
- **Date:** 2026-09-01
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. Plaintext passwords were written to Firestore `users` documents in `saveUsers` and `saveUser`.
  2. All users with plaintext passwords were downloaded to clients and saved in `localStorage['checkin_users']`.
  3. The `User` TypeScript interface contained a `password?: string` field.
  4. The admin UI edit form prefilled and displayed plaintext passwords.
- **Changes Applied:**
  - `src/types.ts`: Removed `password?: string` from the `User` interface.
  - `src/lib/db.ts`: Stripped `password` fields from Firestore synchronization and `localStorage['checkin_users']`. Added defensive sanitization in `getUsers()` and `saveUsers()`.
  - `src/lib/auth.ts`: Removed `password` persistence when creating user documents. Passwords are only transmitted directly to Firebase Auth.
  - `src/components/AdminStaff.tsx`: Removed plaintext password prefilling, display, and update fields in the user edit modal; replaced with secure password reset actions via email.
  - `src/App.tsx`: Added an initialization routine to automatically scrub any legacy `password` fields from `localStorage`.
- **Verification & Testing:**
  - Ran `bun run lint` and `bun run build` to confirm full TypeScript type safety with no `password` property on `User`.
  - Verified that all user saving operations write only sanitized profile fields to Firestore and localStorage.

---

### [H1 / H2] Enforce Strict Firebase Auth and Secure Role Assignment

- **Issue Classification:** HIGH (H1: Authentication succeeds even when Firebase Auth fails, H2: Insecure email string role assignment)
- **Date:** 2026-09-01
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. Login swallowed Firebase Auth errors and returned local matches regardless of whether credentials were valid.
  2. Roles were insecurely assigned via substring matching `email.toLowerCase().includes('admin')`, allowing arbitrary users with "admin" in their email to self-escalate.
  3. Google Sign-In matched arbitrary accounts against local usernames without strict identity checks.
- **Changes Applied:**
  - `src/lib/auth.ts`: Completely refactored `signInWithEmail` to strictly require Firebase Auth authentication (`signInWithEmailAndPassword`). Errors are no longer swallowed; invalid credentials strictly reject the login attempt.
  - `src/lib/auth.ts`: Removed substring role inference (`email.includes('admin')`). Role defaults to `'staff'` unless explicitly assigned in the verified Firestore profile.
  - Hardened error messages to prevent username enumeration (unified "Invalid username or password" response).
- **Verification & Testing:**
  - Verified TypeScript compilation and build passing with zero errors.
  - Confirmed authentication flow requires valid Firebase Auth credentials.

---

### [C6 / H3] Require Real Verification in Staff Approval Modal for Student Checkout

- **Issue Classification:** CRITICAL / HIGH (C6: Staff approval required no verification, H3: Impersonation and unverified checkout)
- **Date:** 2026-09-01
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. Releasing a child from campus only required selecting a staff member's name from a dropdown with zero credential or PIN verification.
  2. Any unauthorized individual at a kiosk could pick an arbitrary staff name and release students.
- **Changes Applied:**
  - `src/components/StaffApprovalModal.tsx`: Added mandatory staff credential verification. The modal now requires entering the authorizing staff member's password and validates it directly against Firebase Auth before permitting student release.
  - Rejection handling: If invalid credentials are provided, authorization is blocked and an error alert is presented.
  - Verified approver logging: The verified staff member's identity is passed and recorded on the attendance checkout record.
- **Verification & Testing:**
  - Verified form validation blocks submission with empty or invalid passwords.
  - Verified UI displays verification status, error notifications, and password toggle controls.
  - Ran `bun run lint` and `bun run build` successfully with zero errors.

---

### [H5] Remove Destructive Auto-Seeding and Protect Maintenance Scripts

- **Issue Classification:** HIGH (H5: Destructive auto-seeding and unguarded maintenance scripts)
- **Date:** 2026-09-01
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. `db.init()` wiped and deleted all student documents whenever document count was <= 10 or matched legacy dummy names.
  2. Standalone scripts (`clear_data.js`, `clear_data2.js`, `seed_firestore.ts`, `migrate_attendance.ts`, `migrate_pickups.ts`) lacked safety confirmation flags and used mismatched database IDs.
- **Changes Applied:**
  - `src/lib/db.ts`: Removed destructive document deletion logic in `db.init()`. Firestore student collection is now only populated if it is completely empty (`studentsSnap.empty`), without deleting existing records.
  - Maintenance scripts: Added mandatory `--confirm` CLI flag checks to `clear_data.js`, `clear_data2.js`, `seed_firestore.ts`, `migrate_attendance.ts`, and `migrate_pickups.ts`. Standardized database instance initialization to use `config.firestoreDatabaseId`.
- **Verification & Testing:**
  - Verified scripts exit safely when invoked without `--confirm`.
  - Ran `bun run lint` and `bun run build` with zero errors.




