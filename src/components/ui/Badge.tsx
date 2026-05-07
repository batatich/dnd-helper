import type { ReactNode, HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

type Props = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  variant?: BadgeVariant
}

export function Badge({
  children,
  variant = 'default',
  className = '',
  ...props
}: Props) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-700 text-gray-200 border-gray-600',
    accent: 'bg-purple-900/60 text-purple-200 border-purple-700',
    success: 'bg-green-900/60 text-green-200 border-green-700',
    warning: 'bg-yellow-900/60 text-yellow-200 border-yellow-700',
    danger: 'bg-red-900/60 text-red-200 border-red-700',
  }

  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}