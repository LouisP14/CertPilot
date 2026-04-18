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

const ALL_DECLARED_PAGES = [
  ...PLAN_PAGES.Starter,
  ...PLAN_PAGES.Pro,
  ...PLAN_PAGES.Business,
]

const FULL_ACCESS_PLANS = ['Business', 'Enterprise', 'Trial', 'Legacy']
const PRO_ACCESS_PLANS = ['Pro', ...FULL_ACCESS_PLANS]

/**
 * Find the most specific declared page that "owns" the given path.
 * e.g. /dashboard/sessions/123 → /dashboard/sessions
 *      /dashboard/sessions     → /dashboard/sessions
 *      /dashboard              → /dashboard
 */
function owningPage(path: string): string | null {
  // Sort by length descending so the longest (most specific) prefix wins
  const sorted = [...ALL_DECLARED_PAGES].sort((a, b) => b.length - a.length)
  for (const p of sorted) {
    if (path === p || path.startsWith(p + '/')) return p
  }
  return null
}

export function canAccessPage(plan: string | null | undefined, path: string): boolean {
  const owner = owningPage(path)
  if (!owner) return false

  if (!plan) {
    return PLAN_PAGES.Starter.includes(owner)
  }
  if (FULL_ACCESS_PLANS.includes(plan)) return true

  const accessiblePages = [
    ...PLAN_PAGES.Starter,
    ...(PRO_ACCESS_PLANS.includes(plan) ? PLAN_PAGES.Pro : []),
    ...(FULL_ACCESS_PLANS.includes(plan) ? PLAN_PAGES.Business : []),
  ]
  return accessiblePages.includes(owner)
}

export function requiredPlanForPage(path: string): 'Pro' | 'Business' | null {
  if (PLAN_PAGES.Business.some((p) => path === p || path.startsWith(p + '/'))) return 'Business'
  if (PLAN_PAGES.Pro.some((p) => path === p || path.startsWith(p + '/'))) return 'Pro'
  return null
}