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

// Параметры маршрута для операций над предметом персонажа.
export const itemParamsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
})

// =========================================================
// Create item
// =========================================================
//
// В Prisma nameSnapshot обязателен.
// Но для удобства API разрешаем не передавать nameSnapshot,
// если предмет создаётся на основе ItemTemplate.
// Тогда service/repository сможет сам заполнить nameSnapshot из template.
//
// Правило:
// - itemTemplateId есть → можно не передавать nameSnapshot
// - itemTemplateId нет → nameSnapshot обязателен
export const createItemSchema = z
  .object({
    itemTemplateId: z.string().uuid().nullable().optional(),

    nameSnapshot: z.string().min(1).optional(),

    quantity: z.number().int().min(1).default(1),

    notes: z.string().nullable().optional(),
  })
  .refine((data) => Boolean(data.itemTemplateId || data.nameSnapshot), {
    message: 'itemTemplateId or nameSnapshot is required',
    path: ['nameSnapshot'],
  }).strict()

// =========================================================
// Update item
// =========================================================
//
// Это частичное обновление данных предмета.
// Экипировку лучше менять через equip/unequip actions,
// но isEquipped пока оставлен для обратной совместимости.
export const updateItemSchema = z.object({
  nameSnapshot: z.string().min(1).optional(),

  quantity: z.number().int().min(1).optional(),

  notes: z.string().nullable().optional(),
}).strict()

// =========================================================
// Equip / unequip actions
// =========================================================
//
// Если предмет имеет один допустимый слот, backend может выбрать его сам.
// Если допустимых слотов несколько, frontend должен передать slot.
// Окончательная проверка допустимости слота всё равно должна быть в service/rules.
export const equipItemSchema = z.object({
  slot: equipmentSlotSchema.optional(),
})

export const unequipItemSchema = z.object({})

// =========================================================
// Types
// =========================================================

export type EquipmentSlotInput = z.infer<typeof equipmentSlotSchema>
export type ItemParamsInput = z.infer<typeof itemParamsSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type EquipItemInput = z.infer<typeof equipItemSchema>
export type UnequipItemInput = z.infer<typeof unequipItemSchema>