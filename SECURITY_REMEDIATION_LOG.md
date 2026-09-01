# Security Remediation Log

This document records all security fixes, refactoring, and hardening changes applied to the Student Check-In / Check-Out system.

---

## Remediation Progress Summary

| Issue ID | Category | Description | Status | Commit / Date |
| :--- | :--- | :--- | :--- | :--- |
| **C1 / C2** | CRITICAL | Remove hardcoded plaintext credentials and universal password backdoors | **RESOLVED** | 2026-09-01 |
| **C4** | CRITICAL | Purge real minor/family PII from repository and provide synthetic seed data | Pending | — |
| **C5** | CRITICAL | Eliminate plaintext password storage in Firestore and client `localStorage` | Pending | — |
| **H1 / H2** | HIGH | Enforce strict Firebase Auth and secure role assignment | Pending | — |
| **C6 / H3** | CRITICAL / HIGH | Require real verification in Staff Approval modal for student checkout | Pending | — |
| **H5** | HIGH | Remove destructive auto-seeding logic and protect maintenance scripts | Pending | — |
| **C3** | CRITICAL | Harden Firestore security rules with authenticated least-privilege policies | Pending | — |
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
