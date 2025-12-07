import { cn } from '@/lib/utils'

interface RequiredIndicatorProps {
  className?: string
}

export function RequiredIndicator({ className }: RequiredIndicatorProps) {
  return (
    <span
      className={cn('text-destructive ml-1', className)}
      aria-label="required"
    >
      *
    </span>
  )
}

export function OptionalBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'text-xs text-muted-foreground ml-2 font-normal',
        className
      )}
    >
      (optional)
    </span>
  )
}
