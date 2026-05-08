import type { Stats } from './characters'

export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'boots'

export type ItemType =
  | 'weapon'
  | 'armor'
  | 'helmet'
  | 'ring'
  | 'amulet'
  | 'boots'
  | 'misc'

export type ItemEffect = {
  stat?: keyof Stats
  value?: number
  armorClassBonus?: number
  hpBonus?: number
  initiativeBonus?: number
}

export type WeaponConfig = {
  attackType: 'melee' | 'ranged'
  ability: keyof Stats
  damageDice: string
  damageBonus: number
  damageType: string
  notes: string
}

/**
 * Старый frontend-тип предмета.
 * Пока оставляем для форм, справочника и старых UI-мест.
 */
export type Item = {
  id: string
  name: string
  type: ItemType
  allowedSlots: EquipmentSlot[]
  effects: ItemEffect[]
  weaponConfig?: WeaponConfig
}

/**
 * Backend-шаблон предмета.
 *
 * Соответствует Prisma ItemTemplate:
 * id, name, type, slot, description, effects.
 */
export type ItemTemplate = {
  id: string
  name: string
  type: ItemType | string | null
  slot: EquipmentSlot | string | null
  description?: string | null
  effects: ItemEffect[] | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

/**
 * Сырая сущность предмета персонажа.
 *
 * Это ближе к Prisma CharacterItem + itemTemplate.
 * Не использовать как основной тип для отображения character sheet,
 * потому что для sheet теперь есть CharacterItemForSheet.
 */
export type CharacterItem = {
  id: string
  characterId: string
  itemTemplateId: string | null

  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  slot: EquipmentSlot | string | null
  notes: string | null

  createdAt?: string | Date
  updatedAt?: string | Date

  itemTemplate?: ItemTemplate | null

  /**
   * Временная совместимость со старыми местами фронта,
   * где могло использоваться template вместо itemTemplate.
   */
  template?: ItemTemplate | null
}

/**
 * UI-ready предмет из GET /characters/:id/sheet.
 *
 * Должен совпадать с backend CharacterItemDto
 * из character-sheet.service.ts.
 *
 * Важно:
 * - itemId здесь string, потому что backend кладёт item.id.
 * - effects уже нормализованы в массив.
 * - allowedSlots уже нормализованы в массив слотов.
 * - equippedSlot уже нормализован или null.
 * - notes остаётся обычной заметкой/сырой строкой, но UI больше не должен
 *   парсить notes ради type/effects/allowedSlots.
 */
export type CharacterItemForSheet = {
  id: string
  itemId: string
  name: string
  type: ItemType | string | null
  effects: ItemEffect[]
  allowedSlots: EquipmentSlot[]
  isEquipped: boolean
  equippedSlot: EquipmentSlot | null
  quantity: number
  notes: string | null
  weaponConfig?: WeaponConfig | null
}