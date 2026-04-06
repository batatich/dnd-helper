type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string
}

export function Textarea({ error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        {...props}
        className={`bg-gray-700 text-white rounded p-2 w-full min-h-[80px] ${
          error ? 'border border-red-500' : ''
        } ${className}`}
      />

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
    </div>
  )
}