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