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
 * Пока оставляем, потому что его могут использовать формы и UI.
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
 *
 * Важно:
 * effects в Prisma — Json?, поэтому на frontend мы ожидаем ItemEffect[] | null.
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
 * Предмет конкретного персонажа.
 *
 * Соответствует Prisma CharacterItem:
 * id, characterId, itemTemplateId, nameSnapshot,
 * quantity, isEquipped, slot, notes, itemTemplate.
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
   * Временная совместимость.
   * В некоторых местах frontend мог использовать template вместо itemTemplate.
   */
  template?: ItemTemplate | null
}

/**
 * UI-ready предмет для листа.
 *
 * Это не обязательно Prisma-модель.
 * Такой тип пригодится позже, когда backend начнёт отдавать предметы
 * уже в нормальном виде без JSON.parse(notes).
 */
export type CharacterItemForSheet = {
  id: string
  itemId: string | null
  name: string
  type: ItemType | string | null
  effects: ItemEffect[]
  allowedSlots: EquipmentSlot[]
  isEquipped: boolean
  equippedSlot: EquipmentSlot | string | null
  quantity: number
  notes: string | null
  weaponConfig?: WeaponConfig
}