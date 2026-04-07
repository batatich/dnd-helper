import { z } from 'zod'

// =========================================================
// Character
// =========================================================

// Параметры маршрута для операций над персонажем
export const characterParamsSchema = z.object({
  id: z.string().uuid(),
})

// Схема создания персонажа
// Здесь валидируются только входные данные клиента.
// Дефолты для части полей можно задавать и здесь, и на уровне сервиса/БД.
export const createCharacterSchema = z.object({
  name: z.string().min(1),
  race: z.string().min(1),
  className: z.string().min(1),
  level: z.number().int().min(1).default(1),
  description: z.string().optional(),
  alignment: z.string().optional(),
  background: z.string().optional(),

  // Разрешаем либо валидный URL, либо пустую строку,
  // которую потом можно нормализовать в null
  avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),

  currentHp: z.number().int().min(0).optional(),
  temporaryHp: z.number().int().min(0).optional(),
  speed: z.number().int().min(0).optional(),
  inspiration: z.boolean().optional(),
})

// Схема частичного обновления персонажа
export const updateCharacterSchema = createCharacterSchema.partial()

// Типы для персонажа
export type CharacterParamsInput = z.infer<typeof characterParamsSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>

// =========================================================
// HP
// =========================================================

// Схема для action endpoint'ов HP: damage / heal / temp HP
export const hpAmountSchema = z.object({
  amount: z.number().int().positive(),
})

export type HpAmountInput = z.infer<typeof hpAmountSchema>

// =========================================================
// Attacks
// =========================================================

// Схема создания атаки
export const createAttackSchema = z.object({
  name: z.string().min(1),
  attackType: z.string().optional(),
  ability: z.string().optional(),
  proficient: z.boolean().optional(),
  damageDice: z.string().optional(),
  damageBonus: z.number().int().optional(),
  damageType: z.string().optional(),
  notes: z.string().optional(),
})

// Схема частичного обновления атаки
export const updateAttackSchema = createAttackSchema.partial()

// Параметры маршрута для операций над атакой
export const attackParamsSchema = z.object({
  id: z.string().uuid(),
  attackId: z.string().uuid(),
})

// Типы для атак
export type AttackParamsInput = z.infer<typeof attackParamsSchema>
export type CreateAttackInput = z.infer<typeof createAttackSchema>
export type UpdateAttackInput = z.infer<typeof updateAttackSchema>

// =========================================================
// Spells
// =========================================================

// Схема создания заклинания
export const createSpellSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0),
  school: z.string().optional(),
  castingTime: z.string().optional(),
  range: z.string().optional(),
  components: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
})

// Схема частичного обновления заклинания
export const updateSpellSchema = createSpellSchema.partial()

// Параметры маршрута для операций над заклинанием
export const spellParamsSchema = z.object({
  id: z.string().uuid(),
  spellId: z.string().uuid(),
})

// Типы для заклинаний
export type SpellParamsInput = z.infer<typeof spellParamsSchema>
export type CreateSpellInput = z.infer<typeof createSpellSchema>
export type UpdateSpellInput = z.infer<typeof updateSpellSchema>

// =========================================================
// Spell slots
// =========================================================

// Один элемент массива spell slots
export const spellSlotItemSchema = z.object({
  level: z.number().int().min(1),
  total: z.number().int().min(0),
  used: z.number().int().min(0),
})

// Обновление всех spell slots персонажа
export const updateSpellSlotsSchema = z.object({
  spellSlots: z.array(spellSlotItemSchema),
})

// Типы для spell slots
export type SpellSlotItemInput = z.infer<typeof spellSlotItemSchema>
export type UpdateSpellSlotsInput = z.infer<typeof updateSpellSlotsSchema>

// =========================================================
// Items / Inventory
// =========================================================

// Параметры маршрута для операций над предметом персонажа
export const itemParamsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
})

// Схема создания предмета в инвентаре персонажа
// Можно либо привязать предмет к ItemTemplate,
// либо создать кастомный предмет только с nameSnapshot.
export const createItemSchema = z
  .object({
    itemTemplateId: z.string().uuid().optional(),

    // Снапшот имени нужен для сохранения текущего названия предмета у персонажа.
    // Для кастомного предмета он обязателен, для шаблонного — опционален.
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

  // nullable нужен, чтобы можно было явно снять slot через PATCH
  slot: z.string().min(1).nullable().optional(),
  notes: z.string().optional(),
})

// Пустые схемы для action endpoint'ов equip / unequip.
// Body у этих маршрутов может быть пустым, потому что itemId уже есть в params.
export const equipItemSchema = z.object({})
export const unequipItemSchema = z.object({})

// Типы для inventory
export type ItemParamsInput = z.infer<typeof itemParamsSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type EquipItemInput = z.infer<typeof equipItemSchema>
export type UnequipItemInput = z.infer<typeof unequipItemSchema>