# Pricing Redesign — CertPilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce real feature differentiation between Starter / Pro / Business via page-level access control, visible-but-locked sidebar badges, an upgrade redirect page, and updated pricing cards with per-tranche pricing.

**Architecture:** Central `plan-features.ts` file is the single source of truth. Each restricted page becomes a Server Component guard that either redirects or renders the client view. The sidebar receives `plan` from the dashboard layout and renders `<PlanBadge>` next to locked items.

**Tech Stack:** Next.js 15 App Router, Server Components, NextAuth v5, Prisma, Vitest, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/plan-features.ts` | Create | Plan pages config + guard helpers |
| `src/__tests__/plan-features.test.ts` | Create | Unit tests for plan helpers |
| `src/components/plan-badge.tsx` | Create | PRO / BUSINESS badge UI |
| `src/components/layout/sidebar.tsx` | Modify | Accept `plan` prop, show `<PlanBadge>` |
| `src/app/dashboard/layout.tsx` | Modify | Pass `plan` to `<Sidebar>` |
| `src/app/dashboard/training-needs/view.tsx` | Create (rename) | Client component (current page.tsx content) |
| `src/app/dashboard/training-needs/page.tsx` | Replace | Server guard → renders `<TrainingNeedsView>` |
| `src/app/dashboard/sessions/view.tsx` | Create (rename) | Client component |
| `src/app/dashboard/sessions/page.tsx` | Replace | Server guard |
| `src/app/dashboard/convocations/view.tsx` | Create (rename) | Client component |
| `src/app/dashboard/convocations/page.tsx` | Replace | Server guard |
| `src/app/dashboard/calendar/view.tsx` | Create (rename) | Client component |
| `src/app/dashboard/calendar/page.tsx` | Replace | Server guard |
| `src/app/dashboard/training-centers/view.tsx` | Create (rename) | Client component |
| `src/app/dashboard/training-centers/page.tsx` | Replace | Server guard |
| `src/app/dashboard/export/view.tsx` | Create (rename) | Client component |
| `src/app/dashboard/export/page.tsx` | Replace | Server guard |
| `src/app/dashboard/audit/view.tsx` | Create (rename) | Client component |
| `src/app/dashboard/audit/page.tsx` | Replace | Server guard |
| `src/app/dashboard/upgrade/page.tsx` | Create | Upgrade redirect page |
| `src/app/dashboard/budget-widget.tsx` | Modify | Accept `plan` prop, hide sessions link for Starter |
| `src/app/dashboard/page.tsx` | Modify | Pass `plan` to `<BudgetWidget>` |
| `src/components/pricing-toggle.tsx` | Rewrite | New plans + 3 tranches + feature lists |
| `src/lib/stripe.ts` | Modify | 9-tranche config structure |

---

## Task 1 — `src/lib/plan-features.ts`

**Files:**
- Create: `src/lib/plan-features.ts`
- Create: `src/__tests__/plan-features.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/__tests__/plan-features.test.ts
import { describe, it, expect } from 'vitest'
import { canAccessPage, requiredPlanForPage } from '@/lib/plan-features'

describe('canAccessPage', () => {
  it('Starter can access /dashboard', () => {
    expect(canAccessPage('Starter', '/dashboard')).toBe(true)
  })
  it('Starter cannot access /dashboard/sessions', () => {
    expect(canAccessPage('Starter', '/dashboard/sessions')).toBe(false)
  })
  it('Pro can access /dashboard/sessions', () => {
    expect(canAccessPage('Pro', '/dashboard/sessions')).toBe(true)
  })
  it('Pro cannot access /dashboard/audit', () => {
    expect(canAccessPage('Pro', '/dashboard/audit')).toBe(false)
  })
  it('Business can access /dashboard/audit', () => {
    expect(canAccessPage('Business', '/dashboard/audit')).toBe(true)
  })
  it('Enterprise can access all pages', () => {
    expect(canAccessPage('Enterprise', '/dashboard/export')).toBe(true)
  })
  it('Trial can access all pages', () => {
    expect(canAccessPage('Trial', '/dashboard/training-centers')).toBe(true)
  })
  it('null plan cannot access restricted pages', () => {
    expect(canAccessPage(null, '/dashboard/sessions')).toBe(false)
  })
  it('null plan can access base pages', () => {
    expect(canAccessPage(null, '/dashboard')).toBe(true)
  })
})

describe('requiredPlanForPage', () => {
  it('returns null for Starter pages', () => {
    expect(requiredPlanForPage('/dashboard/employees')).toBeNull()
  })
  it('returns Pro for sessions', () => {
    expect(requiredPlanForPage('/dashboard/sessions')).toBe('Pro')
  })
  it('returns Business for audit', () => {
    expect(requiredPlanForPage('/dashboard/audit')).toBe('Business')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL (module not found)**

```bash
npx vitest run src/__tests__/plan-features.test.ts
```

- [ ] **Step 3: Create `src/lib/plan-features.ts`**

```ts
export const PLAN_PAGES: Record<'Starter' | 'Pro' | 'Business', string[]> = {
  Starter: [
    '/dashboard',
    '/dashboard/employees',
    '/dashboard/formations',
    '/dashboard/settings',
    '/dashboard/profile',
  ],
  Pro: [
    '/dashboard/training-needs',
    '/dashboard/sessions',
    '/dashboard/convocations',
    '/dashboard/calendar',
  ],
  Business: [
    '/dashboard/training-centers',
    '/dashboard/export',
    '/dashboard/audit',
  ],
}

const FULL_ACCESS_PLANS = ['Business', 'Enterprise', 'Trial', 'Legacy']
const PRO_ACCESS_PLANS = ['Pro', ...FULL_ACCESS_PLANS]

export function canAccessPage(plan: string | null | undefined, path: string): boolean {
  if (!plan) {
    return PLAN_PAGES.Starter.some((p) => path === p || path.startsWith(p + '/'))
  }
  if (FULL_ACCESS_PLANS.includes(plan)) return true

  const allPages = [
    ...PLAN_PAGES.Starter,
    ...(PRO_ACCESS_PLANS.includes(plan) ? PLAN_PAGES.Pro : []),
    ...(FULL_ACCESS_PLANS.includes(plan) ? PLAN_PAGES.Business : []),
  ]
  return allPages.some((p) => path === p || path.startsWith(p + '/'))
}

export function requiredPlanForPage(path: string): 'Pro' | 'Business' | null {
  if (PLAN_PAGES.Business.some((p) => path === p || path.startsWith(p + '/'))) return 'Business'
  if (PLAN_PAGES.Pro.some((p) => path === p || path.startsWith(p + '/'))) return 'Pro'
  return null
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/__tests__/plan-features.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/plan-features.ts src/__tests__/plan-features.test.ts
git commit -m "feat: add plan-features.ts with canAccessPage and requiredPlanForPage"
```

---

## Task 2 — `<PlanBadge>` component

**Files:**
- Create: `src/components/plan-badge.tsx`

- [ ] **Step 1: Create `src/components/plan-badge.tsx`**

```tsx
interface PlanBadgeProps {
  required: 'Pro' | 'Business'
  current: string | null | undefined
}

export function PlanBadge({ required, current }: PlanBadgeProps) {
  if (!current) return null
  if (required === 'Pro' && ['Pro', 'Business', 'Enterprise', 'Trial', 'Legacy'].includes(current)) return null
  if (required === 'Business' && ['Business', 'Enterprise', 'Trial', 'Legacy'].includes(current)) return null

  return (
    <span
      className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${
        required === 'Pro'
          ? 'bg-emerald-500/20 text-emerald-300'
          : 'bg-violet-500/20 text-violet-300'
      }`}
    >
      {required === 'Pro' ? 'PRO' : 'BUSINESS'}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/plan-badge.tsx
git commit -m "feat: add PlanBadge component for sidebar locked items"
```

---

## Task 3 — Update Sidebar to show plan badges

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

The navigation array needs a `requiredPlan` field. The `Sidebar` component needs a `plan` prop.

- [ ] **Step 1: Update navigation array and Sidebar component**

Replace the entire content of `src/components/layout/sidebar.tsx` with:

```tsx
"use client";

import { PlanBadge } from "@/components/plan-badge";
import { cn } from "@/lib/utils";
import {
  Award,
  Building2,
  Calendar,
  CalendarCheck,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Shield,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";

const navigation = [
  { name: "Dashboard",      href: "/dashboard",                icon: LayoutDashboard, managerAllowed: true,  requiredPlan: null },
  { name: "Employés",       href: "/dashboard/employees",      icon: Users,           managerAllowed: true,  requiredPlan: null },
  { name: "Formations",     href: "/dashboard/formations",     icon: Award,           managerAllowed: true,  requiredPlan: null },
  { name: "Besoins",        href: "/dashboard/training-needs", icon: Target,          managerAllowed: true,  requiredPlan: "Pro" as const },
  { name: "Sessions",       href: "/dashboard/sessions",       icon: CalendarCheck,   managerAllowed: true,  requiredPlan: "Pro" as const },
  { name: "Convocations",   href: "/dashboard/convocations",   icon: Mail,            managerAllowed: false, requiredPlan: "Pro" as const },
  { name: "Vue Calendaire", href: "/dashboard/calendar",       icon: Calendar,        managerAllowed: true,  requiredPlan: "Pro" as const },
  { name: "Centres",        href: "/dashboard/training-centers", icon: Building2,     managerAllowed: false, requiredPlan: "Business" as const },
  { name: "Import / Export", href: "/dashboard/export",        icon: FileText,        managerAllowed: false, requiredPlan: "Business" as const },
  { name: "Audit Trail",    href: "/dashboard/audit",          icon: History,         managerAllowed: false, requiredPlan: "Business" as const },
  { name: "Paramètres",     href: "/dashboard/settings",       icon: Settings,        managerAllowed: false, requiredPlan: null },
] as const;

interface SidebarProps {
  userRole?: string;
  plan?: string | null;
}

export function Sidebar({ userRole, plan }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isManager = userRole === "MANAGER";
  const visibleNavigation = navigation.filter((item) =>
    isManager ? item.managerAllowed : true
  );

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col bg-linear-to-b from-[#173B56] via-[#1e4a6b] to-[#0f2a3d] overflow-hidden transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
      {/* Motifs décoratifs subtils */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -right-20 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10 border-b border-white/10 px-4 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            CertPilot
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-none">
        {visibleNavigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const isLocked = item.requiredPlan !== null && !["Pro", "Business", "Enterprise", "Trial", "Legacy"].includes(plan ?? "")
            ? item.requiredPlan === "Business"
              ? !["Business", "Enterprise", "Trial", "Legacy"].includes(plan ?? "")
              : !["Pro", "Business", "Enterprise", "Trial", "Legacy"].includes(plan ?? "")
            : false;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
                  : isLocked
                  ? "text-white/40 hover:bg-white/5 hover:text-white/60"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn("h-5 w-5 shrink-0", isActive && "text-emerald-400")}
              />
              <span className="flex-1 truncate">{item.name}</span>
              {item.requiredPlan && (
                <PlanBadge required={item.requiredPlan} current={plan} />
              )}
            </Link>
          );
        })}

        {/* Lien Administration pour SUPER_ADMIN uniquement */}
        {isSuperAdmin && (
          <>
            <div className="my-4 border-t border-white/10" />
            <Link
              href="/dashboard/admin/demandes"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard/admin/demandes"
                  ? "bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                  : "text-purple-300/70 hover:bg-white/5 hover:text-purple-300",
              )}
            >
              <Mail className="h-5 w-5" />
              Demandes
            </Link>
            <Link
              href="/dashboard/admin/clients"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard/admin/clients"
                  ? "bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                  : "text-purple-300/70 hover:bg-white/5 hover:text-purple-300",
              )}
            >
              <ShieldCheck className="h-5 w-5" />
              Gestion Clients
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={async () => {
            try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
            signOut({ callbackUrl: "/login" });
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: add PlanBadge to sidebar navigation items"
```

---

## Task 4 — Pass `plan` from dashboard layout to Sidebar

**Files:**
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Update layout to pass `plan` to `<Sidebar>`**

In `src/app/dashboard/layout.tsx`, the `subscription` variable already has a `plan` field from `checkSubscription`. Pass it to `<Sidebar>`:

Find this line:
```tsx
<Sidebar userRole={session.user?.role} />
```

Replace with:
```tsx
<Sidebar userRole={session.user?.role} plan={subscription.plan} />
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/layout.tsx
git commit -m "feat: pass subscription plan to Sidebar from dashboard layout"
```

---

## Task 5 — Page guards for 7 restricted pages

**Files (repeat pattern × 7):**
- `training-needs/page.tsx` → renamed content to `view.tsx`, new guard `page.tsx`
- Same for: `sessions`, `convocations`, `calendar`, `training-centers`, `export`, `audit`

### Pattern: Server Component guard

For each page, the new `page.tsx` (Server Component) looks like:

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import { __VIEW_COMPONENT__ } from "./view"

export { metadata } from "./view"   // re-export if view exports metadata

export default async function __PAGE_NAME__Page() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '__PATH__')) {
    redirect('/dashboard/upgrade?feature=__FEATURE__&required=__PLAN__')
  }

  return <__VIEW_COMPONENT__ />
}
```

### 5a — training-needs

- [ ] **Step 1: Rename `src/app/dashboard/training-needs/page.tsx` to `view.tsx`**

```bash
mv "src/app/dashboard/training-needs/page.tsx" "src/app/dashboard/training-needs/view.tsx"
```

- [ ] **Step 2: Create `src/app/dashboard/training-needs/page.tsx`**

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import TrainingNeedsView from "./view"

export default async function TrainingNeedsPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/training-needs')) {
    redirect('/dashboard/upgrade?feature=training-needs&required=Pro')
  }

  return <TrainingNeedsView />
}
```

- [ ] **Step 3: Add default export to `view.tsx` if missing**

Open `src/app/dashboard/training-needs/view.tsx`. If the current `page.tsx` has a default exported function (e.g. `export default function TrainingNeedsPage()`), rename it to `TrainingNeedsView` or keep the name — the import in `page.tsx` uses a default import so any name works.

If the file starts with `"use client"` and has `export default function ...`, it's fine. Just ensure there is a default export.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "training-needs"
```

### 5b — sessions

- [ ] **Step 1: Rename**

```bash
mv "src/app/dashboard/sessions/page.tsx" "src/app/dashboard/sessions/view.tsx"
```

- [ ] **Step 2: Create `src/app/dashboard/sessions/page.tsx`**

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import SessionsView from "./view"

export default async function SessionsPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/sessions')) {
    redirect('/dashboard/upgrade?feature=sessions&required=Pro')
  }

  return <SessionsView />
}
```

### 5c — convocations

- [ ] **Step 1: Rename**

```bash
mv "src/app/dashboard/convocations/page.tsx" "src/app/dashboard/convocations/view.tsx"
```

- [ ] **Step 2: Create `src/app/dashboard/convocations/page.tsx`**

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import ConvocationsView from "./view"

export default async function ConvocationsPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/convocations')) {
    redirect('/dashboard/upgrade?feature=convocations&required=Pro')
  }

  return <ConvocationsView />
}
```

### 5d — calendar

- [ ] **Step 1: Rename**

```bash
mv "src/app/dashboard/calendar/page.tsx" "src/app/dashboard/calendar/view.tsx"
```

- [ ] **Step 2: Create `src/app/dashboard/calendar/page.tsx`**

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import CalendarView from "./view"

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/calendar')) {
    redirect('/dashboard/upgrade?feature=calendar&required=Pro')
  }

  return <CalendarView />
}
```

### 5e — training-centers

- [ ] **Step 1: Rename**

```bash
mv "src/app/dashboard/training-centers/page.tsx" "src/app/dashboard/training-centers/view.tsx"
```

- [ ] **Step 2: Create `src/app/dashboard/training-centers/page.tsx`**

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import TrainingCentersView from "./view"

export default async function TrainingCentersPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/training-centers')) {
    redirect('/dashboard/upgrade?feature=training-centers&required=Business')
  }

  return <TrainingCentersView />
}
```

### 5f — export

- [ ] **Step 1: Rename**

```bash
mv "src/app/dashboard/export/page.tsx" "src/app/dashboard/export/view.tsx"
```

- [ ] **Step 2: Create `src/app/dashboard/export/page.tsx`**

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import ExportView from "./view"

export default async function ExportPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/export')) {
    redirect('/dashboard/upgrade?feature=export&required=Business')
  }

  return <ExportView />
}
```

### 5g — audit

- [ ] **Step 1: Rename**

```bash
mv "src/app/dashboard/audit/page.tsx" "src/app/dashboard/audit/view.tsx"
```

- [ ] **Step 2: Create `src/app/dashboard/audit/page.tsx`**

```tsx
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import AuditView from "./view"

export default async function AuditPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/audit')) {
    redirect('/dashboard/upgrade?feature=audit&required=Business')
  }

  return <AuditView />
}
```

### 5h — Compile check + commit

- [ ] **Step 1: Full TypeScript compile check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 2: Commit all page guards**

```bash
git add src/app/dashboard/training-needs/ src/app/dashboard/sessions/ src/app/dashboard/convocations/ src/app/dashboard/calendar/ src/app/dashboard/training-centers/ src/app/dashboard/export/ src/app/dashboard/audit/
git commit -m "feat: add server-component plan guards to 7 restricted pages"
```

---

## Task 6 — `/dashboard/upgrade` page

**Files:**
- Create: `src/app/dashboard/upgrade/page.tsx`

This page receives `?feature=X&required=Y` in searchParams and shows a contextual upgrade message.

- [ ] **Step 1: Create `src/app/dashboard/upgrade/page.tsx`**

```tsx
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Fonctionnalité non disponible" }

const FEATURE_LABELS: Record<string, { name: string; description: string }> = {
  "training-needs":    { name: "Besoins de formation",     description: "Détection automatique des renouvellements à planifier, avec priorisation par urgence." },
  "sessions":          { name: "Planning & sessions",       description: "Création et suivi des sessions de formation, affectation des participants." },
  "convocations":      { name: "Gestion des convocations", description: "Création et envoi des convocations par email directement depuis la plateforme." },
  "calendar":          { name: "Vue calendaire",            description: "Visualisation de toutes vos sessions et échéances sur un calendrier mensuel." },
  "training-centers":  { name: "Centres de formation",     description: "Répertoire de vos organismes de formation avec contacts et spécialités." },
  "export":            { name: "Import / Export Excel",     description: "Export de vos données employés et formations en Excel, import en masse." },
  "audit":             { name: "Audit Trail",               description: "Journal complet de toutes les actions effectuées sur votre compte (qui, quoi, quand)." },
}

const PLAN_FEATURES: Record<string, string[]> = {
  Pro: [
    "Besoins de formation automatiques",
    "Planning & suivi des sessions",
    "Gestion des convocations",
    "Vue calendaire",
    "Rôle Gestionnaire",
    "Jusqu'à 3 administrateurs",
  ],
  Business: [
    "Tout le plan Pro",
    "Centres de formation",
    "Import / Export Excel",
    "Audit Trail",
    "Administrateurs illimités",
    "Support dédié 7j/7",
  ],
}

interface Props {
  searchParams: Promise<{ feature?: string; required?: string }>
}

export default async function UpgradePage({ searchParams }: Props) {
  const params = await searchParams
  const feature = params.feature ?? ""
  const required = (params.required ?? "Pro") as "Pro" | "Business"

  const featureInfo = FEATURE_LABELS[feature] ?? {
    name: "Cette fonctionnalité",
    description: "Cette fonctionnalité n'est pas disponible dans votre plan actuel.",
  }
  const planFeatures = PLAN_FEATURES[required] ?? []

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
            required === "Pro"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          Plan {required} requis
        </span>

        <h1 className="mt-4 text-2xl font-black text-[#173B56]">
          {featureInfo.name}
        </h1>
        <p className="mt-3 text-slate-500">{featureInfo.description}</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left">
          <p className="mb-4 text-sm font-semibold text-slate-700">
            Ce que vous obtenez avec le plan {required} :
          </p>
          <ul className="space-y-2">
            {planFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Voir les tarifs <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Parler à un conseiller
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Essai gratuit 14 jours — accès complet à toutes les fonctionnalités, sans CB
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "upgrade"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/upgrade/
git commit -m "feat: add /dashboard/upgrade page with contextual plan CTA"
```

---

## Task 7 — Fix BudgetWidget sessions link for Starter

**Files:**
- Modify: `src/app/dashboard/budget-widget.tsx`
- Modify: `src/app/dashboard/page.tsx`

The BudgetWidget has a `<a href="/dashboard/sessions">` link at the bottom (line ~408). Starter users must not see it.

- [ ] **Step 1: Add `plan` prop to `BudgetWidget`**

In `src/app/dashboard/budget-widget.tsx`, find the `BudgetWidget` function signature:

```tsx
export function BudgetWidget() {
```

Replace with:

```tsx
export function BudgetWidget({ plan }: { plan?: string | null }) {
```

- [ ] **Step 2: Wrap sessions link with plan check**

Find the "Lien vers les sessions" block (~lines 403–412):

```tsx
        {/* Lien vers les sessions */}
        <div className="pt-2 border-t">
          <a
            href="/dashboard/sessions"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <TrendingUp className="h-4 w-4" />
            Voir toutes les sessions
          </a>
        </div>
```

Replace with:

```tsx
        {/* Lien vers les sessions — masqué en Starter */}
        {plan !== 'Starter' && (
          <div className="pt-2 border-t">
            <a
              href="/dashboard/sessions"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <TrendingUp className="h-4 w-4" />
              Voir toutes les sessions
            </a>
          </div>
        )}
```

- [ ] **Step 3: Pass `plan` from dashboard page to `BudgetWidget`**

In `src/app/dashboard/page.tsx`, the file imports `BudgetWidget`. The `page.tsx` is a Server Component that already calls `auth()`. Add a plan lookup and pass it:

Find the import section at the top of `src/app/dashboard/page.tsx` and add:

```tsx
import { checkSubscription } from "@/lib/subscription"
```

Then inside the `default export` async function (after `const session = await auth()`), add:

```tsx
  const subscription = await checkSubscription(session?.user?.companyId ?? null)
  const plan = subscription.plan
```

Then find the `<BudgetWidget />` JSX and replace with:

```tsx
<BudgetWidget plan={plan} />
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -E "budget|dashboard/page"
```

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/budget-widget.tsx src/app/dashboard/page.tsx
git commit -m "fix: hide sessions link in BudgetWidget for Starter plan"
```

---

## Task 8 — Rewrite `pricing-toggle.tsx`

**Files:**
- Modify: `src/components/pricing-toggle.tsx`

Current component has wrong plans, wrong prices, and no feature differentiation. Rewrite completely.

- [ ] **Step 1: Rewrite `src/components/pricing-toggle.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";

type Tranche = "1-50" | "51-150" | "151-300";
type Billing = "monthly" | "annual";

const TRANCHES: { label: string; value: Tranche }[] = [
  { label: "1–50 emp.", value: "1-50" },
  { label: "51–150 emp.", value: "51-150" },
  { label: "151–300 emp.", value: "151-300" },
];

const PRICES: Record<string, Record<Tranche, Record<Billing, number>>> = {
  Starter:  { "1-50": { monthly: 69,  annual: 57  }, "51-150": { monthly: 109, annual: 91  }, "151-300": { monthly: 149, annual: 124 } },
  Pro:      { "1-50": { monthly: 149, annual: 124 }, "51-150": { monthly: 229, annual: 190 }, "151-300": { monthly: 329, annual: 273 } },
  Business: { "1-50": { monthly: 349, annual: 290 }, "51-150": { monthly: 499, annual: 414 }, "151-300": { monthly: 699, annual: 580 } },
};

const PLANS = [
  {
    key: "Starter",
    name: "Starter",
    tagline: "Suivi & alertes de conformité",
    popular: false,
    color: "slate",
    included: [
      "Suivi des habilitations (CACES, SST…)",
      "Alertes email J-90 / J-30 / J-7",
      "Détection des renouvellements",
      "Passeport formation (QR code)",
      "1 administrateur",
    ],
    excluded: [
      "Gestion des convocations",
      "Planning & sessions",
      "Audit Trail",
    ],
    adminNote: "1 administrateur",
  },
  {
    key: "Pro",
    name: "Pro",
    tagline: "Automatisation & documentation",
    popular: true,
    color: "emerald",
    included: [
      "Tout Starter",
      "Besoins de formation automatiques",
      "Planning & suivi des sessions",
      "Gestion des convocations",
      "Vue calendaire",
      "Rôle Gestionnaire",
      "3 administrateurs max",
    ],
    excluded: [
      "Centres de formation",
      "Import / Export Excel",
      "Audit Trail",
    ],
    adminNote: "Jusqu'à 3 administrateurs",
  },
  {
    key: "Business",
    name: "Business",
    tagline: "Pilotage & reporting avancé",
    popular: false,
    color: "violet",
    included: [
      "Tout Pro",
      "Centres de formation",
      "Import / Export Excel",
      "Audit Trail",
      "Administrateurs illimités",
      "Support dédié 7j/7",
    ],
    excluded: [],
    adminNote: "Administrateurs illimités",
  },
] as const;

export function PricingToggle() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [tranche, setTranche] = useState<Tranche>("1-50");

  return (
    <div>
      {/* Billing toggle */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`text-sm font-medium transition-colors ${billing === "monthly" ? "font-semibold text-slate-900" : "text-slate-400"}`}
        >
          Mensuel
        </button>
        <button
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className={`relative h-7 w-12 rounded-full transition-colors ${billing === "annual" ? "bg-emerald-500" : "bg-slate-300"}`}
          aria-label="Basculer facturation"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${billing === "annual" ? "left-6" : "left-1"}`}
          />
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={`text-sm transition-colors ${billing === "annual" ? "font-semibold text-slate-900" : "text-slate-400"}`}
        >
          Annuel
        </button>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
          −17%
        </span>
      </div>

      {/* Tranche selector */}
      <div className="mb-10 flex items-center justify-center">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
          {TRANCHES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTranche(t.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tranche === t.value
                  ? "bg-white text-[#173B56] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = PRICES[plan.key][tranche][billing];
          const isPopular = plan.popular;
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl p-6 ${
                isPopular
                  ? "border-2 border-emerald-500 bg-white shadow-xl shadow-emerald-500/10"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Populaire
                </div>
              )}
              <h3 className="text-lg font-semibold text-[#173B56]">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <div className="mt-4">
                <span className="text-4xl font-black text-[#173B56]">{price}€</span>
                <span className="text-slate-500">/mois HT</span>
              </div>
              {billing === "annual" && (
                <p className="mt-1 text-xs text-slate-400">Facturé annuellement</p>
              )}

              <div className="mt-6 flex flex-1 flex-col gap-2">
                {plan.included.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-2.5 w-2.5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </div>
                ))}
                {plan.excluded.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <Minus className="h-2.5 w-2.5 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-400">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/register"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-slate-300 bg-white text-[#173B56] hover:bg-slate-50"
                  }`}
                >
                  Essai gratuit 14j <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/contact?plan=${plan.key.toLowerCase()}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition-all hover:text-[#173B56]"
                >
                  Demander une démo
                </Link>
              </div>
            </div>
          );
        })}

        {/* Enterprise */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-[#173B56]">Enterprise</h3>
          <p className="mt-1 text-sm text-slate-500">300+ employés</p>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#173B56]">Sur devis</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Tarif adapté à vos besoins et à votre volume</p>
          <div className="mt-6 flex flex-1 flex-col gap-2">
            {["Tout Business", "Volume illimité", "SLA contractuel", "Onboarding dédié", "Support prioritaire"].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700">{f}</span>
              </div>
            ))}
          </div>
          <Link
            href="/contact?plan=enterprise"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#173B56] transition-all hover:bg-slate-50"
          >
            Nous contacter <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Essai gratuit 14 jours — accès complet Business, sans carte bancaire
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "pricing-toggle"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/pricing-toggle.tsx
git commit -m "feat: rewrite pricing toggle with 3 plans × 3 tranches + feature lists"
```

---

## Task 9 — Update `src/lib/stripe.ts`

**Files:**
- Modify: `src/lib/stripe.ts`

Replace the flat plan structure with a tranche-aware structure matching the new pricing.

- [ ] **Step 1: Replace `STRIPE_PLANS` in `src/lib/stripe.ts`**

Find the current `STRIPE_PLANS` block and replace with:

```ts
export type PlanKey = 'starter' | 'pro' | 'business'
export type Tranche = '1-50' | '51-150' | '151-300'

export const STRIPE_PLANS: Record<PlanKey, {
  name: string
  tranches: Record<Tranche, {
    employeeLimit: number
    monthly: { price: number; priceId: string }
    annual:  { price: number; priceId: string }
  }>
}> = {
  starter: {
    name: 'Starter',
    tranches: {
      '1-50':    { employeeLimit: 50,  monthly: { price: 69,  priceId: process.env.STRIPE_PRICE_STARTER_50_MONTHLY  ?? '' }, annual: { price: 57,  priceId: process.env.STRIPE_PRICE_STARTER_50_ANNUAL  ?? '' } },
      '51-150':  { employeeLimit: 150, monthly: { price: 109, priceId: process.env.STRIPE_PRICE_STARTER_150_MONTHLY ?? '' }, annual: { price: 91,  priceId: process.env.STRIPE_PRICE_STARTER_150_ANNUAL ?? '' } },
      '151-300': { employeeLimit: 300, monthly: { price: 149, priceId: process.env.STRIPE_PRICE_STARTER_300_MONTHLY ?? '' }, annual: { price: 124, priceId: process.env.STRIPE_PRICE_STARTER_300_ANNUAL ?? '' } },
    },
  },
  pro: {
    name: 'Pro',
    tranches: {
      '1-50':    { employeeLimit: 50,  monthly: { price: 149, priceId: process.env.STRIPE_PRICE_PRO_50_MONTHLY  ?? '' }, annual: { price: 124, priceId: process.env.STRIPE_PRICE_PRO_50_ANNUAL  ?? '' } },
      '51-150':  { employeeLimit: 150, monthly: { price: 229, priceId: process.env.STRIPE_PRICE_PRO_150_MONTHLY ?? '' }, annual: { price: 190, priceId: process.env.STRIPE_PRICE_PRO_150_ANNUAL ?? '' } },
      '151-300': { employeeLimit: 300, monthly: { price: 329, priceId: process.env.STRIPE_PRICE_PRO_300_MONTHLY ?? '' }, annual: { price: 273, priceId: process.env.STRIPE_PRICE_PRO_300_ANNUAL ?? '' } },
    },
  },
  business: {
    name: 'Business',
    tranches: {
      '1-50':    { employeeLimit: 50,  monthly: { price: 349, priceId: process.env.STRIPE_PRICE_BUSINESS_50_MONTHLY  ?? '' }, annual: { price: 290, priceId: process.env.STRIPE_PRICE_BUSINESS_50_ANNUAL  ?? '' } },
      '51-150':  { employeeLimit: 150, monthly: { price: 499, priceId: process.env.STRIPE_PRICE_BUSINESS_150_MONTHLY ?? '' }, annual: { price: 414, priceId: process.env.STRIPE_PRICE_BUSINESS_150_ANNUAL ?? '' } },
      '151-300': { employeeLimit: 300, monthly: { price: 699, priceId: process.env.STRIPE_PRICE_BUSINESS_300_MONTHLY ?? '' }, annual: { price: 580, priceId: process.env.STRIPE_PRICE_BUSINESS_300_ANNUAL ?? '' } },
    },
  },
}

export function isValidPlan(plan: string): plan is PlanKey {
  return plan in STRIPE_PLANS
}

export function getPlanConfig(plan: string) {
  if (isValidPlan(plan)) return STRIPE_PLANS[plan]
  return null
}

export function getPriceId(plan: PlanKey, tranche: Tranche, billing: 'monthly' | 'annual'): string {
  return STRIPE_PLANS[plan].tranches[tranche][billing].priceId
}
```

- [ ] **Step 2: Search for usages of the old STRIPE_PLANS shape to update**

```bash
grep -r "STRIPE_PLANS\|getPlanConfig\|isValidPlan\|priceId\|annualPriceId" src/ --include="*.ts" --include="*.tsx" -l
```

For each file found, update to use the new shape. The main places are typically:
- Stripe webhook handler
- Checkout session creation

If those files reference `plan.priceId` or `plan.annualPriceId`, update them to use `getPriceId(planKey, tranche, billing)`. The tranche must be stored or passed from the subscription checkout flow.

- [ ] **Step 3: Add new env vars to `.env.example` (or equivalent)**

Add to your local `.env` (do NOT commit actual Stripe price IDs if they are live keys):

```
STRIPE_PRICE_STARTER_50_MONTHLY=price_...
STRIPE_PRICE_STARTER_50_ANNUAL=price_...
STRIPE_PRICE_STARTER_150_MONTHLY=price_...
STRIPE_PRICE_STARTER_150_ANNUAL=price_...
STRIPE_PRICE_STARTER_300_MONTHLY=price_...
STRIPE_PRICE_STARTER_300_ANNUAL=price_...
STRIPE_PRICE_PRO_50_MONTHLY=price_...
STRIPE_PRICE_PRO_50_ANNUAL=price_...
STRIPE_PRICE_PRO_150_MONTHLY=price_...
STRIPE_PRICE_PRO_150_ANNUAL=price_...
STRIPE_PRICE_PRO_300_MONTHLY=price_...
STRIPE_PRICE_PRO_300_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_50_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_50_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_150_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_150_ANNUAL=price_...
STRIPE_PRICE_BUSINESS_300_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_300_ANNUAL=price_...
```

> **Note:** The actual Stripe Price objects must be created manually in the Stripe dashboard (Products → Prices) before the env vars can be filled in. This is the only step that requires manual Stripe dashboard work.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/stripe.ts
git commit -m "feat: update stripe.ts to tranche-aware pricing structure (9 combinations)"
```

---

## Spec Coverage Check

| Spec requirement | Covered by task |
|-----------------|----------------|
| `plan-features.ts` central config | Task 1 |
| `canAccessPage()` + `requiredPlanForPage()` | Task 1 |
| Unit tests for plan helpers | Task 1 |
| `<PlanBadge>` PRO / BUSINESS badge | Task 2 |
| Sidebar shows badges + dimmed locked items | Task 3 |
| Layout passes plan to sidebar | Task 4 |
| 7 page guards → redirect to `/dashboard/upgrade` | Task 5 |
| `/dashboard/upgrade` page with context + CTA | Task 6 |
| BudgetWidget sessions link hidden for Starter | Task 7 |
| Pricing toggle with 3 tranches + feature lists | Task 8 |
| Trial has Business-level access | Task 1 (`FULL_ACCESS_PLANS` includes 'Trial') |
| Stripe 9-tranche config | Task 9 |
| Annual toggle default | Task 8 (default state = 'annual') |
| Enterprise card with "Sur devis" | Task 8 |
| Upgrade page shows feature list of required plan | Task 6 |