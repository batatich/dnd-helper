import { z } from 'zod'

// =========================================================
// Character Attacks
// =========================================================

export const attackSourceSchema = z.enum(['manual', 'item'])

export const attackParamsSchema = z.object({
  id: z.string().uuid(),
  attackId: z.string().uuid(),
})

export const createAttackSchema = z.object({
  name: z.string().min(1),
  attackType: z.enum(['melee', 'ranged', 'spell']),
  ability: z.enum([
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma',
  ]),
  proficient: z.boolean().default(false),
  damageDice: z.string().nullable().optional(),
  damageBonus: z.number().int().default(0),
  damageType: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  source: attackSourceSchema.default('manual'),
  itemId: z.string().uuid().nullable().optional(),
})

export const updateAttackSchema = createAttackSchema.partial()

export type CreateAttackInput = z.infer<typeof createAttackSchema>
export type UpdateAttackInput = z.infer<typeof updateAttackSchema>