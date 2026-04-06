type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}

export function Input({ error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <input
        {...props}
        className={`bg-gray-700 text-white rounded p-2 w-full ${
          error ? 'border border-red-500' : ''
        } ${className}`}
      />

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
    </div>
  )
}