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

// Источник атаки:
// manual — создана вручную
// item — привязана к предмету
export const attackSourceSchema = z.enum(['manual', 'item'])

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
  class: z.string().min(1, 'Class is required'),

  level: z.number().int().min(1).max(20).default(1),

  description: z.string().optional(),
  alignment: z.string().optional(),
  background: z.string().optional(),

  // Разрешаем либо валидный URL, либо пустую строку, либо отсутствие поля
  avatarUrl: z.string().url().optional().or(z.literal('')).optional(),

  currentHp: z.number().int().min(0).default(0),
  temporaryHp: z.number().int().min(0).default(0),
  speed: z.number().int().min(0).default(30),
  inspiration: z.boolean().default(false),

  spellcastingAbility: spellcastingAbilitySchema.optional(),

  deathSaveSuccesses: z.number().int().min(0).max(3).default(0),
  deathSaveFailures: z.number().int().min(0).max(3).default(0),

  hitDiceTotal: z.number().int().min(0).optional(),
  hitDiceUsed: z.number().int().min(0).default(0),
  hitDiceDice: z.string().optional(),
})

// Частичное обновление персонажа
export const updateCharacterSchema = createCharacterSchema.partial()

// Типы для персонажа
export type CharacterParamsInput = z.infer<typeof characterParamsSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>

// =========================================================
// Character stats
// =========================================================

// Базовое значение характеристики.
// Сейчас разрешаем диапазон 1–30.
//
// Почему 1–30:
// - 1 — минимальное значение, чтобы не было нулевых/отрицательных статов
// - 30 — верхняя безопасная граница для D&D-подобной системы
export const abilityScoreSchema = z.number().int().min(1).max(30)

// Отдельная сущность CharacterStats живёт в Prisma отдельно,
// поэтому и схема для неё отдельная.
//
// Эта схема используется, когда клиент отправляет полный набор статов вручную.
export const characterStatsSchema = z.object({
  strength: abilityScoreSchema,
  dexterity: abilityScoreSchema,
  constitution: abilityScoreSchema,
  intelligence: abilityScoreSchema,
  wisdom: abilityScoreSchema,
  charisma: abilityScoreSchema,
})

// Создание stats.
// При создании/полной ручной установке лучше требовать все 6 характеристик.
export const createCharacterStatsSchema = characterStatsSchema

// Частичное обновление stats.
// Это пригодится, если позже захочешь обновлять только один стат,
// например только constitution или только strength.
export const updateCharacterStatsSchema = characterStatsSchema.partial()

// Типы для stats
export type CharacterStatsInput = z.infer<typeof characterStatsSchema>
export type CreateCharacterStatsInput = z.infer<
  typeof createCharacterStatsSchema
>
export type UpdateCharacterStatsInput = z.infer<
  typeof updateCharacterStatsSchema
>
// =========================================================
// HP
// =========================================================

// Универсальная схема для действий damage / heal / temp HP
export const hpAmountSchema = z.object({
  amount: z.number().int().positive(),
})

// Отдельная схема для прямой установки temp HP
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

// Типы для HP
export type HpAmountInput = z.infer<typeof hpAmountSchema>
export type SetTemporaryHpInput = z.infer<typeof setTemporaryHpSchema>
export type LevelUpInput = z.infer<typeof levelUpSchema>

// =========================================================
// Attacks
// =========================================================

// Параметры маршрута для операций над атакой
export const attackParamsSchema = z.object({
  id: z.string().uuid(),
  attackId: z.string().uuid(),
})

// Схема создания атаки
// characterId не приходит с клиента, потому что берётся из params маршрута
export const createAttackSchema = z.object({
  name: z.string().min(1, 'Attack name is required'),

  attackType: z.string().optional(),
  ability: z.string().optional(),
  proficient: z.boolean().optional(),

  damageDice: z.string().optional(),
  damageBonus: z.number().int().optional(),
  damageType: z.string().optional(),
  notes: z.string().optional(),

  source: attackSourceSchema.optional(),
  itemId: z.string().uuid().optional(),
})

// Частичное обновление атаки
export const updateAttackSchema = createAttackSchema.partial()

// Типы для атак
export type AttackParamsInput = z.infer<typeof attackParamsSchema>
export type CreateAttackInput = z.infer<typeof createAttackSchema>
export type UpdateAttackInput = z.infer<typeof updateAttackSchema>

// =========================================================
// Spells
// =========================================================

// Параметры маршрута для операций над заклинанием
export const spellParamsSchema = z.object({
  id: z.string().uuid(),
  spellId: z.string().uuid(),
})

// Схема создания заклинания
export const createSpellSchema = z.object({
  name: z.string().min(1, 'Spell name is required'),
  level: z.number().int().min(0),

  school: z.string().optional(),
  castingTime: z.string().optional(),
  range: z.string().optional(),
  components: z.string().optional(),
  duration: z.string().optional(),

  concentration: z.boolean().optional(),
  ritual: z.boolean().optional(),

  description: z.string().optional(),
})

// Частичное обновление заклинания
export const updateSpellSchema = createSpellSchema.partial()

// Типы для заклинаний
export type SpellParamsInput = z.infer<typeof spellParamsSchema>
export type CreateSpellInput = z.infer<typeof createSpellSchema>
export type UpdateSpellInput = z.infer<typeof updateSpellSchema>

// =========================================================
// Spell slots
// =========================================================

// Один слот заклинаний.
// Prisma хранит spellSlots как Json, но на уровне API
// мы валидируем его как нормальный массив объектов.
export const spellSlotItemSchema = z.object({
  level: z.number().int().min(1).max(9),
  total: z.number().int().min(0),
  used: z.number().int().min(0),
})

// Полная замена массива spell slots
export const updateSpellSlotsSchema = z.object({
  spellSlots: z.array(spellSlotItemSchema),
})

// Типы для spell slots
export type SpellSlotItemInput = z.infer<typeof spellSlotItemSchema>
export type UpdateSpellSlotsInput = z.infer<typeof updateSpellSlotsSchema>

// =========================================================
// Items / Inventory
// =========================================================

// Параметры маршрута для операций над предметом
export const itemParamsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
})

// Схема создания предмета персонажа
// В Prisma nameSnapshot обязателен.
// Но для удобства API можно разрешить не передавать его,
// если предмет создаётся на основе ItemTemplate.
// Тогда backend сможет сам заполнить nameSnapshot из template.
export const createItemSchema = z
  .object({
    itemTemplateId: z.string().uuid().optional(),

    // Для кастомного предмета nameSnapshot обязателен.
    // Для template-предмета можно позволить не передавать его с клиента.
    nameSnapshot: z.string().min(1).optional(),

    quantity: z.number().int().min(1).optional(),
    isEquipped: z.boolean().optional(),
    slot: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Boolean(data.itemTemplateId || data.nameSnapshot), {
    message: 'itemTemplateId or nameSnapshot is required',
    path: ['nameSnapshot'],
  })

// Схема частичного обновления предмета
export const updateItemSchema = z.object({
  nameSnapshot: z.string().min(1).optional(),
  quantity: z.number().int().min(1).optional(),
  isEquipped: z.boolean().optional(),

  // nullable нужен, чтобы можно было явно снять предмет со слота
  slot: z.string().min(1).nullable().optional(),
  notes: z.string().optional(),
})

// Отдельные action-схемы для equip / unequip
export const equipItemSchema = z.object({
  isEquipped: z.literal(true).optional(),
  slot: z.string().min(1).optional(),
})

export const unequipItemSchema = z.object({
  isEquipped: z.literal(false).optional(),
})

// Типы для inventory
export type ItemParamsInput = z.infer<typeof itemParamsSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type EquipItemInput = z.infer<typeof equipItemSchema>
export type UnequipItemInput = z.infer<typeof unequipItemSchema>