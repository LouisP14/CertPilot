# Admin Limits per Plan — Implementation Spec

## Goal

Allow the SUPER_ADMIN (Louis) to add multiple ADMIN users to a client company, up to the plan limit. Display admin and manager counts in the UI.

## Architecture

The SUPER_ADMIN remains the sole creator of ADMIN accounts. A new "Add an administrator" button appears on each client row in Gestion Clients. The system enforces the admin limit server-side before creation. Managers remain unlimited for all plans.

**Tech Stack:** Next.js 16, Prisma, PostgreSQL, Resend (email)

---

## Plan Limits

| Plan | Admin limit (`adminLimit`) | Manager limit |
|---|---|---|
| Starter | 1 | unlimited |
| Pro | 3 | unlimited |
| Business | null (unlimited) | unlimited |
| Enterprise | null (unlimited) | unlimited |

`adminLimit = null` means unlimited.

---

## Schema Changes

**`prisma/schema.prisma` — Company model:**
Add one field:
```
adminLimit Int?   // null = unlimited. 1 for Starter, 3 for Pro, null for Business/Enterprise
```

**Migration:** `ALTER TABLE "Company" ADD COLUMN "adminLimit" INTEGER;`

Set automatically on company creation based on plan:
- `starter` → `adminLimit: 1`
- `pro` → `adminLimit: 3`
- `business` → `adminLimit: null`
- `enterprise` → `adminLimit: null`

---

## API Changes

### `POST /api/admin/clients/add-admin`

New endpoint. SUPER_ADMIN only.

**Request body:**
```json
{
  "companyId": "string",
  "name": "string",
  "email": "string"
}
```

**Logic:**
1. Verify session is SUPER_ADMIN
2. Load company → get `adminLimit`
3. Count current ADMIN users for the company
4. If `adminLimit !== null && currentAdminCount >= adminLimit` → return 403 with error message
5. Generate temporary password
6. Create User with `role: "ADMIN"`, `mustChangePassword: true`, `companyId`
7. Send welcome email (same as existing client creation email)
8. Return created user

### `GET /api/admin/clients` (existing, extend response)

Add to each company object:
- `adminCount: number` — count of ADMIN users
- `managerCount: number` — count of MANAGER users
- `adminLimit: number | null`

---

## UI Changes

### 1. Gestion Clients — Client card (`src/app/dashboard/admin/clients/page.tsx`)

**Current:** `1 / 100 employés`

**After:** Add two lines below:
- `1 / 3 admins` (or `1 / ∞` if unlimited)
- `2 managers`

**Add button** on each client card: `+ Ajouter un admin`
- Disabled + tooltip "Limite atteinte" if `adminCount >= adminLimit` (and `adminLimit !== null`)
- Opens a modal/inline form with: Nom, Email → "Créer l'administrateur"

### 2. Profile page — Subscription section (`src/app/dashboard/profile/page.tsx`)

**Current:** `Employés : 13 / 100` with progress bar

**After:** Add below:
- `Administrateurs : X / Y` with progress bar (Y = adminLimit or "∞")
- `Managers : Z` (no progress bar, no limit)

---

## Email

Reuse the existing welcome/client creation email (`sendWelcomeEmail` or equivalent in `src/lib/email.ts`).
Same content as when Louis creates a new client account: temporary password, login link, must-change-password notice.

---

## What Does NOT Change

- ADMIN users cannot create other ADMIN users (already blocked by API)
- Managers are unlimited — no enforcement, only display
- SUPER_ADMIN creates all ADMIN accounts (unchanged flow)
- Employee limit enforcement is untouched

---

## Out of Scope

- Removing/downgrading an admin when plan is downgraded (handle manually for now)
- Manager limits per plan (not sold, not enforced)