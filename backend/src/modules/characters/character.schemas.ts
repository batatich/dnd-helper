import { z } from 'zod'
import { characterStatsSchema } from '../character-stats/character-stats.schemas'

// =========================================================
// Общие enum/списки
// =========================================================

export const spellcastingAbilitySchema = z.enum([
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
])

// =========================================================
// Shared field schemas
// =========================================================

const optionalNullableStringSchema = z.string().nullable().optional()

const avatarUrlSchema = z
  .string()
  .url()
  .or(z.literal(''))
  .nullable()
  .optional()

// =========================================================
// Character
// =========================================================

// Параметры маршрута для операций над персонажем.
export const characterParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

// Схема создания персонажа.
//
// Важно:
// - create character создаёт базового персонажа;
// - stats создаются в repository из baseStats или дефолтными значениями;
// - HP / death saves / hit dice задаются в characterService;
// - attacks / spells / inventory создаются отдельными endpoints;
// - null разрешён для nullable profile-полей, чтобы frontend мог явно
//   отправлять пустое значение.
export const createCharacterSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    race: z.string().min(1, 'Race is required'),
    className: z.string().min(1, 'Class is required'),

    level: z.number().int().min(1).max(20).default(1),

    description: optionalNullableStringSchema,
    alignment: optionalNullableStringSchema,
    background: optionalNullableStringSchema,
    avatarUrl: avatarUrlSchema,

    speed: z.number().int().min(0).default(30),

    spellcastingAbility: spellcastingAbilitySchema.nullable().optional(),

    baseStats: characterStatsSchema.optional(),
  })
  .strict()

// Частичное обновление базового профиля персонажа.
//
// Важно:
// Через PATCH /characters/:id НЕ меняем:
// - currentHp
// - temporaryHp
// - deathSaveSuccesses
// - deathSaveFailures
// - hitDiceTotal
// - hitDiceUsed
// - hitDiceDice
// - inspiration
// - spellSlots
// - stats
// - attacks
// - spells
// - inventory
//
// Для них есть отдельные modules/actions.
export const updateCharacterSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    race: z.string().min(1, 'Race is required').optional(),
    className: z.string().min(1, 'Class is required').optional(),

    description: optionalNullableStringSchema,
    alignment: optionalNullableStringSchema,
    background: optionalNullableStringSchema,
    avatarUrl: avatarUrlSchema,

    speed: z.number().int().min(0).optional(),

    spellcastingAbility: spellcastingAbilitySchema.nullable().optional(),
  })
  .strict()

// =========================================================
// Types
// =========================================================

export type CharacterParamsInput = z.infer<typeof characterParamsSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
