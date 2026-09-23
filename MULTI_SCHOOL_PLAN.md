# Multi-School Implementation Plan

Goal: evaluate two architecture options for multi-school support by implementing
both in isolated branches, then comparing them.

- **Option 1** — Multi-school within the existing single application (tenant scoped by logged-in user)
- **Option 2** — Separate subdomain/dashboard per school (tenant scoped by subdomain)

---

## 0. Local environment safety (do this first, before any branch work)

**Do NOT connect to the production database for any of this work.** These branches
specifically test tenant-isolation logic — if there's a bug, a shared prod DB turns
a caught bug into a real data leak across real schools.

Instructions for the agent:

```
1. Set up a local Postgres/MySQL instance via Docker Compose for development.
2. Copy .env.example to .env.local and point DATABASE_URL at the local instance.
3. Run all migrations against the local DB only — never against production.
4. Seed the local DB with test schools/staff/students data — never seed or
   modify production.
5. Add a startup safety check: if NODE_ENV=development but DATABASE_URL
   matches the production host/connection string, refuse to start and print
   a warning.
```

Guardrail to add near the DB connection setup:

```js
if (process.env.DATABASE_URL?.includes('prod-db-host') && process.env.NODE_ENV !== 'production') {
  throw new Error('Refusing to connect to production DB outside of production environment');
}
```

### Optional: realistic data without the risk

If local seed data isn't representative enough, clone and anonymize prod data instead
of connecting to it directly:

```
Create scripts/clone-prod-for-dev.sh that:
1. Takes a pg_dump (or mysqldump) of production — schema + data.
2. Restores it into a local Docker DB instance.
3. Runs an anonymization pass on PII fields (student names, staff emails,
   phone numbers, addresses) using a library like Faker.
4. Never writes back to production; this script is read-only against prod.
```

---

## 1. Branch structure

```
main
 └── feature/multi-school-base            (shared groundwork)
      ├── feature/multi-tenant-single-app  (Option 1)
      └── feature/subdomain-per-school     (Option 2)
```

Both options share the data model and tenant-scoping groundwork. Build that once
on a base branch so the two experiments start from identical footing and don't drift
apart on anything unrelated to the actual architecture difference. Any future schema
change should land on the base branch and get merged into both experiment branches —
don't fork the schema.

---

## 2. Base branch — shared groundwork

Branch: `feature/multi-school-base` (from `main`)

```
1. Add a `School` entity/table with fields: id, name, slug, created_at, etc.
2. Add a `school_id` foreign key to: Staff, Students, Attendance Records,
   Pickup Records (and any other tables scoped to a school).
3. Update all existing queries/repositories to filter by school_id.
4. Add a school_id (tenant context) resolver, stubbed for now (e.g. always
   return School A) — actual resolution logic differs between the two
   approaches and is implemented per-branch.
5. Write migrations for the schema changes.
6. Add seed data for at least 2 schools with their own staff/students, for
   testing isolation.

Do not implement login/subdomain routing yet — that comes next.
```

---

## 3. Branch A — Multi-school within single app (Option 1)

Branch: `feature/multi-tenant-single-app` (from `feature/multi-school-base`)

```
Implement school resolution based on the LOGGED-IN USER, not the URL:

1. When a staff member logs in, look up their school_id from their user record.
2. Store school_id in the session/JWT after login.
3. Add middleware that injects school_id into every request context automatically.
4. Update all data access to always scope by the session's school_id — never
   accept school_id from the request body/params, to prevent cross-school
   data leaks.
5. Dashboard UI stays the same for all schools (single set of templates),
   just shows that school's data.
6. Add a basic super-admin role that can switch between schools for support
   purposes (tests the "central admin" characteristic).

Write integration tests confirming a School A staff member cannot see School B's
students/attendance/pickup records even if they guess IDs in the URL.
```

**Key guardrail:** never derive `school_id` from client-supplied data (URL params,
request body) — this is the most common way multi-tenant apps leak data across tenants.

---

## 4. Branch B — Subdomain per school (Option 2)

Branch: `feature/subdomain-per-school` (from `feature/multi-school-base`)

```
Implement school resolution based on SUBDOMAIN:

1. Add middleware that parses the subdomain from the incoming request
   (e.g. school-a.example.com -> slug "school-a").
2. Look up the School by slug and inject school_id into request context.
3. Scope login to that subdomain's school (a School A user shouldn't be able
   to log into school-b.example.com, or if they can, they should still only
   see School A data).
4. For local dev, set up subdomain routing via /etc/hosts entries or a dev
   proxy (e.g. school-a.localhost:3000, school-b.localhost:3000) — document
   setup steps in the README.
5. Add a basic per-school branding hook (school.logo_url, school.theme_color)
   to demonstrate the branding advantage of this approach.

Write integration tests confirming requests to the school-a subdomain never leak
school-b data, and that login is properly scoped per subdomain.
```

**Infra note:** testing subdomains beyond localhost needs a wildcard DNS entry and
wildcard SSL cert — flag this to infra early if you plan to test beyond local dev.

---

## 5. Comparing the results

Once both branches are implemented, have the agent report on:

- Lines of code / files touched in each
- Extra infra needed (wildcard DNS, SSL certs, local dev complexity)
- Complexity added by subdomain routing vs. session-based scoping
- Test results for data isolation in each branch

---

## Quick reference checklist

- [ ] Local Docker DB set up, `.env.local` pointed at it
- [ ] Prod-DB startup guardrail added
- [ ] `feature/multi-school-base` created with School entity, FKs, migrations, seed data
- [ ] `feature/multi-tenant-single-app` created and implemented
- [ ] `feature/subdomain-per-school` created and implemented
- [ ] Isolation integration tests passing on both branches
- [ ] Comparison notes written up
