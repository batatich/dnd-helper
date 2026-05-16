import { z } from 'zod'

// =========================================================
// Character Attacks
// =========================================================

export const attackParamsSchema = z.object({
  id: z.string().uuid(),
  attackId: z.string().uuid(),
})

export const attackTypeSchema = z.enum(['melee', 'ranged', 'spell'])

export const attackAbilitySchema = z.enum([
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
])

export const createAttackSchema = z.object({
  name: z.string().min(1),
  attackType: attackTypeSchema,
  ability: attackAbilitySchema,
  proficient: z.boolean().default(false),
  damageDice: z.string().nullable().optional(),
  damageBonus: z.number().int().default(0),
  damageType: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
}) 
.strict()

export const updateAttackSchema = createAttackSchema.partial().strict()

export type CreateAttackInput = z.infer<typeof createAttackSchema>
export type UpdateAttackInput = z.infer<typeof updateAttackSchema>