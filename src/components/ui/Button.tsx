type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: Props) {
  const base = 'px-4 py-2 rounded text-white transition'

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-500',
    danger: 'bg-red-600 hover:bg-red-700',
  }

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`}
    />
  )
}