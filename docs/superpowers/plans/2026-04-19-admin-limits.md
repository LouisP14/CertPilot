# Admin Limits per Plan — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow SUPER_ADMIN to add multiple ADMIN users per client company up to the plan limit (Starter=1, Pro=3, Business=unlimited), and display admin + manager counts in the UI.

**Architecture:** Add `adminLimit Int?` to the Company model (null = unlimited). A new `POST /api/admin/clients/add-admin` endpoint enforces the limit server-side. The Clients admin page gains a "+ Ajouter un admin" button per client with an inline form. The Profile page shows admin and manager counts below the employee progress bar.

**Tech Stack:** Next.js 16, Prisma/PostgreSQL, Resend (email via `sendWelcomeEmail`)

---

## File Map

| File | Action | What changes |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `adminLimit Int?` to Company |
| `prisma/migrations/20260419_add_admin_limit/migration.sql` | Create | ALTER TABLE migration |
| `src/app/api/admin/clients/route.ts` | Modify | Set `adminLimit` on creation; return role-split counts in GET |
| `src/app/api/admin/clients/add-admin/route.ts` | Create | New endpoint to add an ADMIN to an existing company |
| `src/app/api/profile/route.ts` | Modify | Return `adminCount` and `managerCount` in GET response |
| `src/app/dashboard/admin/clients/page.tsx` | Modify | Show admin/manager counts + "+ Ajouter un admin" inline form |
| `src/app/dashboard/profile/page.tsx` | Modify | Show admin/manager counts below employee progress bar |

---

## Task 1: Prisma Schema — Add `adminLimit` to Company

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260419_add_admin_limit/migration.sql`

- [ ] **Step 1: Add field to schema**

Open `prisma/schema.prisma`. In the Company model, add after `employeeLimit`:

```prisma
  employeeLimit         Int        @default(50)  // Limite d'employés selon le plan
  adminLimit            Int?                      // null = illimité (Business/Enterprise). 1 = Starter, 3 = Pro
```

- [ ] **Step 2: Create migration file**

Create directory and file:

```bash
mkdir -p prisma/migrations/20260419_add_admin_limit
```

Write `prisma/migrations/20260419_add_admin_limit/migration.sql`:

```sql
ALTER TABLE "Company" ADD COLUMN "adminLimit" INTEGER;
```

- [ ] **Step 3: Apply migration and regenerate client**

```bash
npx prisma migrate deploy
npx prisma generate
```

Expected: no errors, Prisma client regenerated.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260419_add_admin_limit/
git commit -m "feat: add adminLimit field to Company model"
```

---

## Task 2: Update GET /api/admin/clients — Return Admin & Manager Counts

**Files:**
- Modify: `src/app/api/admin/clients/route.ts` lines 132–172

- [ ] **Step 1: Update the GET handler to split user counts by role**

Replace the entire `GET` function with:

```typescript
// GET - Liste des entreprises/clients (SUPER_ADMIN only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    const companies = await prisma.company.findMany({
      include: {
        users: {
          where: { isActive: true },
          select: { id: true, email: true, name: true, role: true },
        },
        _count: {
          select: {
            employees: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = companies.map((company) => ({
      ...company,
      adminCount: company.users.filter((u) => u.role === "ADMIN").length,
      managerCount: company.users.filter((u) => u.role === "MANAGER").length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur récupération clients:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd passeport-formation && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors on this file.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/clients/route.ts
git commit -m "feat: return admin/manager counts in GET /api/admin/clients"
```

---

## Task 3: Update POST /api/admin/clients — Set adminLimit on Company Creation

**Files:**
- Modify: `src/app/api/admin/clients/route.ts` lines 8–130

- [ ] **Step 1: Add adminLimit to PLAN_CONFIGS and company creation**

In `src/app/api/admin/clients/route.ts`, replace the `PLAN_CONFIGS` constant and the company creation block:

```typescript
const PLAN_CONFIGS: Record<string, { name: string; employeeLimit: number; adminLimit: number | null }> = {
  starter:    { name: "Starter",    employeeLimit: 50,   adminLimit: 1    },
  pro:        { name: "Pro",        employeeLimit: 150,  adminLimit: 3    },
  business:   { name: "Business",   employeeLimit: 300,  adminLimit: null },
  enterprise: { name: "Enterprise", employeeLimit: 1000, adminLimit: null },
};
```

Then in the company creation block (around line 68), add `adminLimit`:

```typescript
    const company = await prisma.company.create({
      data: {
        name: companyName,
        adminEmail: email.toLowerCase(),
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: planConfig.name,
        employeeLimit: planConfig.employeeLimit,
        adminLimit: planConfig.adminLimit,
        trialEndsAt: null,
      },
    });
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/clients/route.ts
git commit -m "feat: set adminLimit on company creation based on plan"
```

---

## Task 4: Create POST /api/admin/clients/add-admin Endpoint

**Files:**
- Create: `src/app/api/admin/clients/add-admin/route.ts`

- [ ] **Step 1: Create the file**

```typescript
import { auth } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { companyId, name, email, password } = body;

    if (!companyId || !name || !email || !password) {
      return NextResponse.json(
        { error: "companyId, name, email et password sont requis" },
        { status: 400 },
      );
    }

    // Charger la company avec son adminLimit
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, subscriptionPlan: true, adminLimit: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    }

    // Compter les ADMIN actifs de la company
    const currentAdminCount = await prisma.user.count({
      where: { companyId, role: "ADMIN", isActive: true },
    });

    // Enforcer la limite
    if (company.adminLimit !== null && currentAdminCount >= company.adminLimit) {
      return NextResponse.json(
        {
          error: `Limite d'administrateurs atteinte (${company.adminLimit} max pour ce plan)`,
        },
        { status: 403 },
      );
    }

    // Vérifier unicité email
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: "ADMIN",
        companyId,
        mustChangePassword: true,
        emailVerified: true,
      },
    });

    // Envoyer email de bienvenue
    try {
      await sendWelcomeEmail({
        to: email.toLowerCase(),
        contactName: name,
        companyName: company.name,
        plan: (company.subscriptionPlan ?? "business").toLowerCase(),
        tempPassword: password,
      });
    } catch (emailError) {
      console.error("Erreur envoi email bienvenue (add-admin):", emailError);
    }

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur add-admin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'administrateur" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/clients/add-admin/route.ts
git commit -m "feat: add POST /api/admin/clients/add-admin endpoint with limit enforcement"
```

---

## Task 5: Update Profile API — Return Admin & Manager Counts

**Files:**
- Modify: `src/app/api/profile/route.ts`

- [ ] **Step 1: Add adminCount and managerCount queries**

In `src/app/api/profile/route.ts`, after the `employeeCount` query (around line 50), add:

```typescript
    // Compter les employés actifs de l'entreprise
    let employeeCount = 0;
    let adminCount = 0;
    let managerCount = 0;
    if (user.company?.id) {
      [employeeCount, adminCount, managerCount] = await Promise.all([
        prisma.employee.count({
          where: { companyId: user.company.id, isActive: true },
        }),
        prisma.user.count({
          where: { companyId: user.company.id, role: "ADMIN", isActive: true },
        }),
        prisma.user.count({
          where: { companyId: user.company.id, role: "MANAGER", isActive: true },
        }),
      ]);
    }
```

Then add `adminLimit` to the company select block:

```typescript
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialEndsAt: true,
            employeeLimit: true,
            adminLimit: true,
            adminEmail: true,
          },
        },
```

And update the return to include the new counts:

```typescript
    return NextResponse.json({
      ...user,
      employeeCount,
      adminCount,
      managerCount,
    });
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/profile/route.ts
git commit -m "feat: return adminCount/managerCount in profile API"
```

---

## Task 6: Update Clients Admin Page — Counts Display + Add Admin Form

**Files:**
- Modify: `src/app/dashboard/admin/clients/page.tsx`

- [ ] **Step 1: Update the Client interface**

Replace the existing `Client` interface (lines 19–31):

```typescript
interface Client {
  id: string;
  name: string;
  adminEmail: string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string;
  employeeLimit: number;
  adminLimit: number | null;
  adminCount: number;
  managerCount: number;
  createdAt: string;
  _count?: {
    employees: number;
  };
}
```

- [ ] **Step 2: Add state for the add-admin inline form**

After the existing state declarations (after line 49), add:

```typescript
  const [addingAdminFor, setAddingAdminFor] = useState<string | null>(null);
  const [addAdminForm, setAddAdminForm] = useState({ name: "", email: "", password: "" });
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminMessage, setAddAdminMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
```

- [ ] **Step 3: Add generateAdminPassword helper function**

After the existing `generatePassword` function (after line 113), add:

```typescript
  const generateAdminPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddAdminForm((prev) => ({ ...prev, password }));
  };
```

- [ ] **Step 4: Add handleAddAdmin submit function**

After `handleDeleteClient` (after line 181), add:

```typescript
  const handleAddAdmin = async (clientId: string) => {
    if (!addAdminForm.name || !addAdminForm.email || !addAdminForm.password) {
      setAddAdminMessage({ type: "error", text: "Tous les champs sont requis" });
      return;
    }
    setAddAdminLoading(true);
    setAddAdminMessage(null);
    try {
      const res = await fetch("/api/admin/clients/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: clientId,
          name: addAdminForm.name,
          email: addAdminForm.email,
          password: addAdminForm.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddAdminMessage({
          type: "success",
          text: `✅ Admin créé !\n📧 ${addAdminForm.email}\n🔑 ${addAdminForm.password}\n📤 Email envoyé !`,
        });
        setAddAdminForm({ name: "", email: "", password: "" });
        fetchClients();
      } else {
        setAddAdminMessage({ type: "error", text: data.error || "Erreur" });
      }
    } catch {
      setAddAdminMessage({ type: "error", text: "Erreur serveur" });
    } finally {
      setAddAdminLoading(false);
    }
  };
```

- [ ] **Step 5: Update the client row JSX to show counts and add-admin button**

Replace the client row JSX block (the `<div key={client.id} ...>` from line 469 to line 532) with:

```tsx
                    <div key={client.id} className="rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50">
                      {/* Row principale */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{client.name}</h4>
                            <p className="text-sm text-gray-500">{client.adminEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">{client._count?.employees || 0}</span>
                              {" / "}{client.employeeLimit} employés
                            </p>
                            <p className="text-gray-500">
                              <span className="font-medium">{client.adminCount}</span>
                              {client.adminLimit !== null ? `/${client.adminLimit}` : ""} admin
                              {" · "}
                              <span className="font-medium">{client.managerCount}</span> manager
                              {client.managerCount > 1 ? "s" : ""}
                            </p>
                            <p className="text-gray-400">{client.subscriptionPlan || "Starter"}</p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              client.subscriptionStatus === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-700"
                                : client.subscriptionStatus === "TRIAL"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {client.subscriptionStatus === "ACTIVE" ? "Actif" : client.subscriptionStatus === "TRIAL" ? "Essai" : "Expiré"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={client.adminLimit !== null && client.adminCount >= client.adminLimit}
                            title={
                              client.adminLimit !== null && client.adminCount >= client.adminLimit
                                ? `Limite atteinte (${client.adminLimit} admin max)`
                                : "Ajouter un administrateur"
                            }
                            onClick={() => {
                              setAddingAdminFor(addingAdminFor === client.id ? null : client.id);
                              setAddAdminMessage(null);
                              setAddAdminForm({ name: "", email: "", password: "" });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Admin
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            disabled={deletingId === client.id}
                          >
                            {deletingId === client.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Formulaire add-admin inline */}
                      {addingAdminFor === client.id && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <h5 className="mb-3 text-sm font-semibold text-[#173B56]">
                            Ajouter un administrateur à {client.name}
                          </h5>
                          {addAdminMessage && (
                            <div
                              className={`mb-3 rounded-lg border p-3 text-sm font-medium whitespace-pre-line ${
                                addAdminMessage.type === "success"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-red-200 bg-red-50 text-red-800"
                              }`}
                            >
                              {addAdminMessage.text}
                            </div>
                          )}
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <Label htmlFor={`admin-name-${client.id}`} className="text-xs">Nom *</Label>
                              <Input
                                id={`admin-name-${client.id}`}
                                value={addAdminForm.name}
                                onChange={(e) => setAddAdminForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Prénom Nom"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`admin-email-${client.id}`} className="text-xs">Email *</Label>
                              <Input
                                id={`admin-email-${client.id}`}
                                type="email"
                                value={addAdminForm.email}
                                onChange={(e) => setAddAdminForm((p) => ({ ...p, email: e.target.value }))}
                                placeholder="admin@entreprise.fr"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`admin-pwd-${client.id}`} className="text-xs">Mot de passe temp. *</Label>
                              <div className="mt-1 flex gap-2">
                                <Input
                                  id={`admin-pwd-${client.id}`}
                                  value={addAdminForm.password}
                                  onChange={(e) => setAddAdminForm((p) => ({ ...p, password: e.target.value }))}
                                  placeholder="Générer →"
                                  className="font-mono"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={generateAdminPassword}>
                                  <Key className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              disabled={addAdminLoading}
                              onClick={() => handleAddAdmin(client.id)}
                            >
                              {addAdminLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Plus className="h-4 w-4 mr-1" />
                              )}
                              Créer l&apos;administrateur
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setAddingAdminFor(null); setAddAdminMessage(null); }}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/admin/clients/page.tsx
git commit -m "feat: show admin/manager counts and add-admin inline form in clients page"
```

---

## Task 7: Update Profile Page — Show Admin & Manager Counts

**Files:**
- Modify: `src/app/dashboard/profile/page.tsx`

- [ ] **Step 1: Update ProfileData interface**

In `src/app/dashboard/profile/page.tsx`, update the `ProfileData` interface (around line 36) to add `adminCount`, `managerCount`, and `adminLimit` in the company:

```typescript
interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  employeeCount: number;
  adminCount: number;
  managerCount: number;
  company: {
    id: string;
    name: string;
    logo: string | null;
    subscriptionStatus: string;
    subscriptionPlan: string | null;
    trialEndsAt: string | null;
    employeeLimit: number;
    adminLimit: number | null;
    adminEmail: string | null;
  } | null;
}
```

- [ ] **Step 2: Add admin/manager count display below the employee progress bar**

After the employee progress bar closing `</div>` (around line 433), add the following two rows **before** the trial days block:

```tsx
                {/* Administrateurs */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Administrateurs</span>
                  <span className="text-sm font-medium">
                    <span className="text-[#173B56] font-semibold">{profile.adminCount}</span>
                    {profile.company.adminLimit !== null ? (
                      <span className="text-slate-400"> / {profile.company.adminLimit}</span>
                    ) : (
                      <span className="text-slate-400"> / ∞</span>
                    )}
                  </span>
                </div>
                {profile.company.adminLimit !== null && (
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        profile.adminCount / profile.company.adminLimit > 0.9
                          ? "bg-red-500"
                          : profile.adminCount / profile.company.adminLimit > 0.7
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (profile.adminCount / profile.company.adminLimit) * 100)}%`,
                      }}
                    />
                  </div>
                )}

                {/* Managers */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Managers</span>
                  <span className="text-sm font-medium">
                    <span className="text-[#173B56] font-semibold">{profile.managerCount}</span>
                    <span className="text-slate-400"> / ∞</span>
                  </span>
                </div>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/profile/page.tsx
git commit -m "feat: show admin/manager counts on profile page"
```

---

## Final Verification

- [ ] Build the app: `npm run build` — expected: no errors
- [ ] Push: `git push`
- [ ] Manual test:
  1. As SUPER_ADMIN, create a Starter client → adminLimit=1
  2. In the client row, click "+ Admin" → should show form
  3. Submit → admin created, email sent, count shows 1/1
  4. Click "+ Admin" again → button should be disabled ("Limite atteinte")
  5. As ADMIN, go to Profile → should show "Administrateurs 1/1" and "Managers X/∞"
  6. Create a Pro client, add 3 admins → 4th should be blocked (403)