type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string
}

export function Select({ error, className = '', children, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <select
        {...props}
        className={`bg-gray-700 text-white rounded p-2 w-full ${
          error ? 'border border-red-500' : ''
        } ${className}`}
      >
        {children}
      </select>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
    </div>
  )
}