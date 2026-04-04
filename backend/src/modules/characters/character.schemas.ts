import { z } from 'zod'

export const createCharacterSchema = z.object({
  name: z.string().min(1),
  race: z.string().min(1),
  className: z.string().min(1),
  level: z.number().int().min(1).default(1),
  description: z.string().optional(),
  alignment: z.string().optional(),
  background: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')).optional(),
  currentHp: z.number().int().min(0).optional(),
  temporaryHp: z.number().int().min(0).optional(),
  speed: z.number().int().min(0).optional(),
  inspiration: z.boolean().optional(),
})

export const updateCharacterSchema = createCharacterSchema.partial()

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>