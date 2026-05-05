import { z } from 'zod'

// =========================================================
// Character Inventory / Items
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