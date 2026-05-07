import type { ReactNode, HTMLAttributes } from 'react'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: Props) {
  return (
    <div
      {...props}
      className={`bg-gray-800/90 border border-gray-700 rounded-xl p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}