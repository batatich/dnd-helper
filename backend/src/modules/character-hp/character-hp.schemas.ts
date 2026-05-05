import { z } from 'zod'

// =========================================================
// Character HP
// =========================================================

// Универсальная схема для действий damage / heal.
// amount должен быть положительным числом.
export const hpAmountSchema = z.object({
  amount: z.number().int().positive(),
})

// Отдельная схема для прямой установки temporary HP.
// temporary HP может быть 0, поэтому min(0), а не positive().
export const setTemporaryHpSchema = z.object({
  amount: z.number().int().min(0),
})

// Схема для повышения уровня персонажа.
// hpMode определяет, как считается прибавка HP:
// fixed — фиксированное значение, сейчас +5 для 1d8
// roll — сервер бросает кость хитов, сейчас 1d8
export const levelUpSchema = z.object({
  hpMode: z.enum(['fixed', 'roll']),
})

export type HpAmountInput = z.infer<typeof hpAmountSchema>
export type SetTemporaryHpInput = z.infer<typeof setTemporaryHpSchema>
export type LevelUpInput = z.infer<typeof levelUpSchema>