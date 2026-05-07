// =========================================================
// Spell Slots Rules
// =========================================================
// Здесь лежит доменная логика изменения spell slots.
//
// Frontend больше не должен сам считать:
// - used не ниже 0
// - used не выше total
// - что делать при изменении total
//
// Frontend должен отправлять действие:
// - установить total
// - использовать слот
// - восстановить слот
// =========================================================

export type SpellSlot = {
  level: number
  total: number
  used: number
}

export class SpellSlotConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpellSlotConflictError'
  }
}

// =========================================================
// normalizeSpellSlots
// =========================================================
// Приводит значение из БД к безопасному массиву spell slots.
// Если в БД null, мусор или не массив — возвращаем [].
// =========================================================

export function normalizeSpellSlots(value: unknown): SpellSlot[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((slot) => {
      if (typeof slot !== 'object' || slot === null) {
        return null
      }

      const rawSlot = slot as {
        level?: unknown
        total?: unknown
        used?: unknown
      }

      const level = Number(rawSlot.level)
      const total = Number(rawSlot.total)
      const used = Number(rawSlot.used)

      if (
        !Number.isInteger(level) ||
        level < 1 ||
        level > 9 ||
        !Number.isInteger(total) ||
        total < 0 ||
        !Number.isInteger(used) ||
        used < 0
      ) {
        return null
      }

      return {
        level,
        total,
        used: Math.min(used, total),
      }
    })
    .filter((slot): slot is SpellSlot => slot !== null)
    .sort((a, b) => a.level - b.level)
}

// =========================================================
// setSpellSlotTotal
// =========================================================
// Устанавливает максимум слотов конкретного уровня.
// Если used стал больше нового total — обрезаем used до total.
// Если слота ещё нет — создаём его.
// =========================================================

export function setSpellSlotTotal(
  currentSlots: SpellSlot[],
  level: number,
  total: number,
): SpellSlot[] {
  const slots = normalizeSpellSlots(currentSlots)
  const existingSlot = slots.find((slot) => slot.level === level)

  if (!existingSlot) {
    return [
      ...slots,
      {
        level,
        total,
        used: 0,
      },
    ].sort((a, b) => a.level - b.level)
  }

  return slots
    .map((slot) => {
      if (slot.level !== level) {
        return slot
      }

      return {
        ...slot,
        total,
        used: Math.min(slot.used, total),
      }
    })
    .sort((a, b) => a.level - b.level)
}

// =========================================================
// useSpellSlot
// =========================================================
// Использует 1 слот указанного уровня.
// Если слота нет или все слоты уже потрачены — ошибка 409.
// =========================================================

export function useSpellSlot(
  currentSlots: SpellSlot[],
  level: number,
): SpellSlot[] {
  const slots = normalizeSpellSlots(currentSlots)
  const slot = slots.find((entry) => entry.level === level)

  if (!slot || slot.total <= 0) {
    throw new SpellSlotConflictError(
      `Spell slot level ${level} is not available`,
    )
  }

  if (slot.used >= slot.total) {
    throw new SpellSlotConflictError(
      `All spell slots of level ${level} are already used`,
    )
  }

  return slots.map((entry) =>
    entry.level === level
      ? {
          ...entry,
          used: entry.used + 1,
        }
      : entry,
  )
}

// =========================================================
// restoreSpellSlot
// =========================================================
// Восстанавливает 1 слот указанного уровня.
// Если used уже 0 — ошибка 409.
// =========================================================

export function restoreSpellSlot(
  currentSlots: SpellSlot[],
  level: number,
): SpellSlot[] {
  const slots = normalizeSpellSlots(currentSlots)
  const slot = slots.find((entry) => entry.level === level)

  if (!slot) {
    throw new SpellSlotConflictError(
      `Spell slot level ${level} is not available`,
    )
  }

  if (slot.used <= 0) {
    throw new SpellSlotConflictError(
      `Spell slot level ${level} is already fully restored`,
    )
  }

  return slots.map((entry) =>
    entry.level === level
      ? {
          ...entry,
          used: entry.used - 1,
        }
      : entry,
  )
}