import { z } from 'zod'

// =========================================================
// Character Inventory / Items
// =========================================================

// Единый список слотов экипировки.
// Должен совпадать с frontend EquipmentSlot.
export const equipmentSlotSchema = z.enum([
  'mainHand',
  'offHand',
  'head',
  'body',
  'ring1',
  'ring2',
  'amulet',
  'boots',
])

// Типы предметов пока оставляем строкой, а не enum,
// чтобы не заблокировать кастомные предметы и будущие типы.
// Примеры: weapon, armor, shield, ring, amulet, consumable, misc.
const itemTypeSchema = z.string().min(1)

// Временная гибкая схема для effects.
// Более строгую типизацию эффектов можно сделать отдельно,
// когда окончательно зафиксируем все виды item effects.
const itemEffectsSchema = z.array(z.unknown())

// Weapon config нужен для generated attacks от экипированного оружия.
const weaponConfigSchema = z
  .object({
    attackType: z.enum(['melee', 'ranged', 'spell']).optional(),
    ability: z
      .enum([
        'strength',
        'dexterity',
        'constitution',
        'intelligence',
        'wisdom',
        'charisma',
      ])
      .optional(),
    damageDice: z.string().optional(),
    damageBonus: z.number().int().optional(),
    damageType: z.string().optional(),
    notes: z.string().nullable().optional(),
  })
  .strict()

// Параметры маршрута для операций над предметом персонажа.
export const itemParamsSchema = z
  .object({
    id: z.string().uuid(),
    itemId: z.string().uuid(),
  })
  .strict()

// =========================================================
// Create item
// =========================================================
//
// Правило:
// - itemTemplateId есть → можно не передавать nameSnapshot
// - itemTemplateId нет → nameSnapshot обязателен
//
// Важно:
// - isEquipped/equippedSlot не принимаем
// - update item НЕ принимает equippedSlot
// - equippedSlot меняется только через equip/unequip
// Если допустимых слотов несколько, frontend должен передать equippedSlot.
export const createItemSchema = z
  .object({
    itemTemplateId: z.string().uuid().nullable().optional(),

    nameSnapshot: z.string().min(1).optional(),

    quantity: z.number().int().min(1).default(1),

    notes: z.string().nullable().optional(),

    // Кастомные игровые поля конкретного CharacterItem.
    // Если они не переданы, позже service/sheet сможет взять fallback из ItemTemplate.
    type: itemTypeSchema.nullable().optional(),

    allowedSlots: z.array(equipmentSlotSchema).nullable().optional(),

    effects: itemEffectsSchema.nullable().optional(),

    weaponConfig: weaponConfigSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Boolean(data.itemTemplateId || data.nameSnapshot), {
    message: 'itemTemplateId or nameSnapshot is required',
    path: ['nameSnapshot'],
  })

// =========================================================
// Update item
// =========================================================
//
// Это частичное обновление данных предмета.
// Экипировку меняем только через equip/unequip actions.
//
// Важно:
// - update item НЕ принимает isEquipped
// - update item НЕ принимает equippedSlot
// - equippedSlot меняется только через equip/unequip
export const updateItemSchema = z
  .object({
    nameSnapshot: z.string().min(1).optional(),

    quantity: z.number().int().min(1).optional(),

    notes: z.string().nullable().optional(),

    type: itemTypeSchema.nullable().optional(),

    allowedSlots: z.array(equipmentSlotSchema).nullable().optional(),

    effects: itemEffectsSchema.nullable().optional(),

    weaponConfig: weaponConfigSchema.nullable().optional(),
  })
  .strict()

// =========================================================
// Equip / unequip actions
// =========================================================
//
// Если предмет имеет один допустимый слот, backend может выбрать его сам.
// Если допустимых слотов несколько, frontend должен передать equippedSlot.
// Окончательная проверка допустимости слота всё равно в service.
export const equipItemSchema = z
  .object({
    equippedSlot: equipmentSlotSchema.optional(),
  })
  .strict()

export const unequipItemSchema = z.object({}).strict()

// =========================================================
// Types
// =========================================================

export type EquipmentSlotInput = z.infer<typeof equipmentSlotSchema>
export type ItemParamsInput = z.infer<typeof itemParamsSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type EquipItemInput = z.infer<typeof equipItemSchema>
export type UnequipItemInput = z.infer<typeof unequipItemSchema>