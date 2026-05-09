import { z } from 'zod'

// =========================================================
// Общие enum/списки
// =========================================================

// Допустимые spellcasting ability для персонажа
export const spellcastingAbilitySchema = z.enum([
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
])

// =========================================================
// Character
// =========================================================

// Параметры маршрута для операций над персонажем
export const characterParamsSchema = z.object({
  id: z.string().uuid(),
})

// Схема создания персонажа
// Здесь валидируются только поля самой модели Character.
// stats, attacks, spells и items — отдельные сущности и отдельные схемы ниже.
export const createCharacterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  race: z.string().min(1, 'Race is required'),
  className: z.string().min(1, 'Class is required'),

  level: z.number().int().min(1).max(20).default(1),

  description: z.string().optional(),
  alignment: z.string().optional(),
  background: z.string().optional(),

  // Разрешаем либо валидный URL, либо пустую строку, либо отсутствие поля
  avatarUrl: z.string().url().optional().or(z.literal('')).optional(),

  speed: z.number().int().min(0).default(30),
  spellcastingAbility: spellcastingAbilitySchema.optional(),
}) .strict()

// Частичное обновление персонажа
export const updateCharacterSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  race: z.string().min(1, 'Race is required').optional(),
  className: z.string().min(1, 'Class is required').optional(),
  level: z.number().int().min(1).max(20).optional(),

  description: z.string().nullable().optional(),
  alignment: z.string().nullable().optional(),
  background: z.string().nullable().optional(),
  avatarUrl: z.string().url().or(z.literal('')).nullable().optional(),

  speed: z.number().int().min(0).optional(),
  spellcastingAbility: spellcastingAbilitySchema.nullable().optional(),
}) .strict()

// Типы для персонажа
export type CharacterParamsInput = z.infer<typeof characterParamsSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
