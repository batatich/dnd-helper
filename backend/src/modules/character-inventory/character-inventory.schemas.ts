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
// - create item НЕ экипирует предмет
// - isEquipped/slot не принимаем
export const createItemSchema = z
  .object({
    itemTemplateId: z.string().uuid().nullable().optional(),

    nameSnapshot: z.string().min(1).optional(),

    quantity: z.number().int().min(1).default(1),

    notes: z.string().nullable().optional(),
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
export const updateItemSchema = z
  .object({
    nameSnapshot: z.string().min(1).optional(),

    quantity: z.number().int().min(1).optional(),

    notes: z.string().nullable().optional(),
  })
  .strict()

// =========================================================
// Equip / unequip actions
// =========================================================
//
// Если предмет имеет один допустимый слот, backend может выбрать его сам.
// Если допустимых слотов несколько, frontend должен передать slot.
// Окончательная проверка допустимости слота всё равно в service.
export const equipItemSchema = z
  .object({
    slot: equipmentSlotSchema.optional(),
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