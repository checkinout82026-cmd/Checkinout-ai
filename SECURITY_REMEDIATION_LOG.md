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
| **C6 / H3** | CRITICAL / HIGH | Require real verification in Staff Approval modal for student checkout | **RESOLVED** | 2026-09-02 |
| **H5** | HIGH | Remove destructive auto-seeding logic and protect maintenance scripts | **RESOLVED** | 2026-09-02 |
| **C3** | CRITICAL | Harden Firestore security rules with authenticated least-privilege policies | **RESOLVED** | 2026-09-02 |
| **H4** | HIGH | Clarify simulated SMS notification status and state handling | **RESOLVED** | 2026-09-02 |
| **H6 / M / L** | HIGH / MED / LOW | Kiosk session hardening, input sanitization, dependency and config cleanup | **RESOLVED** | 2026-09-02 |
| **SEC-DEEP** | HIGH / MED / LOW | Firestore privilege escalation fix, CSV injection defense, username enumeration mitigation, CSP/headers, and auto-lock | **RESOLVED** | 2026-09-02 |
| **SEC-LOCKOUT** | CRITICAL | Prevent admin self-deletion and sole-administrator lockout | **RESOLVED** | 2026-09-02 |

---

## Detailed Remediation Entries

### [C1 / C2] Remove Hardcoded Credentials and Universal Password Backdoors

- **Issue Classification:** CRITICAL (C1: Hardcoded credentials in repo, C2: Universal backdoor password)
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

---

### [C3] Lockdown Firestore Security Rules

- **Issue Classification:** CRITICAL (C3: Firestore database open to the world)
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. `firestore.rules` previously contained `allow read, write: if true;` across all collections.
  2. Any anonymous party could read/overwrite/delete the entire database or forge admin records.
  3. `firebase-blueprint.json` had plaintext `password` schema definition.
- **Changes Applied:**
  - `firestore.rules`: Replaced wide-open rules with strict role-based policies requiring authentication (`request.auth != null`), role checking helpers (`isAdmin()`, `isStaffOrAdmin()`), and preventing `password` field persistence.
  - `firebase-blueprint.json`: Removed `password` from the User entity schema definition.
- **Verification & Testing:**
  - Verified rule syntax and conditions for all collections (`users`, `students`, `authorized_pickups`, `attendance`).
  - Ran `bun run lint` and `bun run build` to confirm integration.

---

### [H4] Simulated SMS Transparency and Delivery State Handling

- **Issue Classification:** HIGH (H4: SMS notifications are simulated — parents get false assurance)
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. Attendance records marked `smsNotificationSent: true` without an actual SMS provider, misleading operators and parents into believing SMS alerts were delivered externally.
  2. UI toast and banners claimed messages were delivered.
- **Changes Applied:**
  - `src/types.ts`: Added SMS delivery lifecycle fields (`smsStatus: 'simulated' | 'queued' | 'sent' | 'delivered' | 'failed' | 'disabled'`, `smsProvider`, `smsError`).
  - `src/components/StudentDashboard.tsx`, `src/components/CheckInOut.tsx`, `src/components/AdminAttendance.tsx`: Updated checkout workflows and UI banners to clearly flag SMS as "Demo Simulation" and record `smsStatus: 'simulated'`, avoiding false claims of external SMS dispatch.
- **Verification & Testing:**
  - Verified UI displays "Demo Simulation" badges and clear simulation notices.
  - Ran `bun run lint` and `bun run build` with zero errors.

---

### [H6 / M / L] Kiosk Session Hardening, Input Sanitization & Dependency Cleanup

- **Issue Classification:** HIGH / MEDIUM / LOW (H6: Session & PII persistence on shared kiosks, M3: Unused dependencies, M5: Input parsing)
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. On shared kiosks, logging out left full student and attendance records cached in browser `localStorage`.
  2. Over-provisioned and unused dependencies (`express`, `dotenv`, `@google/genai`, `react-router-dom`, `motion`) inflated attack surface.
  3. `metadata.json` contained unconfigured capability flags.
  4. CSV import fallback generated predictable, collision-prone IDs (`1000${i}`).
- **Changes Applied:**
  - `src/App.tsx`: Updated `handleLogout` to comprehensively wipe `checkin_users`, `checkin_students`, and `checkin_attendance` from `localStorage` upon logout.
  - `package.json`: Removed 7 unused dependencies and duplicate build tools. Updated dev script to default to localhost instead of wildcard `0.0.0.0`.
  - `metadata.json`: Removed `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` claim.
  - `src/lib/csvParser.ts`: Upgraded fallback ID generation to use `crypto.randomUUID()`.
- **Verification & Testing:**
  - Pruned unused dependencies and updated `bun.lock` (7 packages safely removed).
  - Executed `bun run lint` and `bun run build` with zero errors.
  - Verified bundle size and cleanliness.

---

### [SEC-DEEP] Deep Security Audit & Hardening (Phase 2)

- **Issue Classification:** HIGH / MEDIUM / LOW (Privilege Escalation, CSV Injection CWE-1236, Account Enumeration, Missing Headers)
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed & Remediations Applied:**
  1. **Firestore Self-Privilege Escalation Prevention (`firestore.rules`):**
     - Previously, authenticated users updating their own user record could theoretically modify their `role` field to `'admin'`.
     - Added rule restriction ensuring non-admin users cannot alter their existing `role` field during updates (`request.resource.data.role == resource.data.role`).
  2. **CSV Formula Injection Mitigation (`src/lib/utils.ts`, `AdminStudents.tsx`, `AdminAttendance.tsx`):**
     - Implemented `sanitizeCsvCell` following OWASP CWE-1236 guidelines. Prepend `'` to fields starting with formula trigger symbols (`=`, `+`, `-`, `@`, `\t`, `\r`) to prevent malicious formula execution in Excel/Google Sheets.
  3. **Username Enumeration Mitigation (`src/components/Login.tsx`, `src/lib/auth.ts`):**
     - Unified authentication failure errors into a generic "Invalid username or password" message, preventing attackers from probing for registered usernames.
     - Removed insecure default email guessing (`@school.org`) in password reset workflow.
  4. **Dynamic Configuration Injection (`src/lib/firebase.ts`):**
     - Allowed `import.meta.env` environment variables (`VITE_FIREBASE_API_KEY`, etc.) to take precedence over committed JSON configurations for production deployments.
  5. **Session Authorization Integrity & Inactivity Auto-Lock (`src/App.tsx`):**
     - Synchronized client state with Firebase Auth: if Firebase Auth reports an unauthenticated state, untrusted local storage session is immediately invalidated.
     - Added a 15-minute inactivity auto-lock on shared kiosk/terminal displays to protect unattended sessions.
  6. **Autocomplete Data Exposure Protection (`src/components/CheckInOut.tsx`):**
     - Required a minimum 2-character query length before exposing student suggestions in check-in search.
  7. **HTTP Security Headers & Meta Tags (`index.html`, `vite.config.ts`):**
     - Added `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, and `Permissions-Policy`.
  8. **Firebase Auth Provider Error Handling (`src/lib/auth.ts`, `Login.tsx`, `StaffApprovalModal.tsx`):**
     - Handled `auth/operation-not-allowed` (`PASSWORD_LOGIN_DISABLED`) with explicit user instructions when the Email/Password sign-in provider is disabled in the Firebase Console.
- **Verification & Testing:**
  - Added `src/vite-env.d.ts` for type safety.
  - Executed `bun run lint` and `bun run build` with zero errors.

---

### [SEC-LOCKOUT] Prevent Admin Self-Deletion and Sole-Administrator Lockout

- **Issue Classification:** CRITICAL (Admin self-deletion, permanent administrative lockout risk)
- **Date:** 2026-09-02
- **Status:** **RESOLVED**
- **Vulnerabilities Addressed:**
  1. An administrator viewing the Staff & Admin management view could click the delete button next to their own account, deleting themselves.
  2. If the last administrator was deleted or demoted to staff, the system would become permanently orphaned with zero administrators.
  3. Firestore security rules did not restrict an admin from deleting their own user document.
- **Changes Applied:**
  - `firestore.rules`: Updated user deletion rule to enforce `allow delete: if isAdmin() && request.auth.uid != userId;`, rejecting self-deletion at the database security level.
  - `src/lib/db.ts`: In `db.deleteUser(id)`, added a validation guard preventing the deletion of the sole remaining active administrator.
  - `src/components/AdminStaff.tsx`:
    - Accepted `currentUser` prop (with fallback to active session).
    - Added `isUserSelf` check to dynamically identify the active administrator across UID, username, and email.
    - Replaced the delete icon with a "You" badge on the active administrator's row.
    - Replaced the delete icon with a "Sole Admin" badge if only one administrator remains in the system.
    - Added programmatic guards in `deleteStaff` blocking self-deletion and last-admin deletion with clear error alerts.
    - In edit modal, blocked self-demotion to staff if no other active administrator exists.
  - `src/App.tsx`: Passed `currentUser={user}` into `<AdminStaff />`.
- **Verification & Testing:**
  - Verified UI displays "You" badge and suppresses delete button for the current admin.
  - Verified delete prevention for the sole administrator account.
  - Ran `bun run lint` and `bun run build` with zero errors.










