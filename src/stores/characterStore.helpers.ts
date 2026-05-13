export const getErrorMessage = (
  fallback: string,
  error: unknown
): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}