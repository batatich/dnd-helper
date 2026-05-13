/**
 * Убирает только undefined.
 *
 * null оставляем, потому что backend может использовать null
 * как осознанную очистку nullable-поля:
 * description: null
 * avatarUrl: null
 * spellcastingAbility: null
 */
export function removeUndefinedValues<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )
}