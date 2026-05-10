import { z } from 'zod'

// =========================================================
// Character Spells
// =========================================================

export const spellParamsSchema = z.object({
  id: z.string().uuid(),
  spellId: z.string().uuid(),
})
.strict()

export const createSpellSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0).max(9),

  school: z.string().nullable().optional(),
  castingTime: z.string().nullable().optional(),
  range: z.string().nullable().optional(),
  components: z.string().nullable().optional(),

  duration: z.string().nullable().optional(),
  description: z.string().nullable().optional(),

  concentration: z.boolean().default(false),
  ritual: z.boolean().default(false),
})
.strict()

export const updateSpellSchema = createSpellSchema.partial().strict()

// =========================================================
// Spell slots
// =========================================================

export const spellSlotParamsSchema = z.object({
  id: z.string().uuid(),
  level: z.coerce.number().int().min(1).max(9),
})
.strict()

export const setSpellSlotTotalBodySchema = z.object({
  total: z.number().int().min(0).max(99),
})
.strict()

export type CreateSpellInput = z.infer<typeof createSpellSchema>
export type UpdateSpellInput = z.infer<typeof updateSpellSchema>
export type SpellSlotParamsInput = z.infer<typeof spellSlotParamsSchema>
export type SetSpellSlotTotalInput = z.infer<typeof setSpellSlotTotalBodySchema>