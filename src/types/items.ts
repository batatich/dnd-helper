import type { Stats } from "./characters"

export type EquipmentSlot =
  | "mainHand"
  | "offHand"
  | "head"
  | "body"
  | "ring1"
  | "ring2"
  | "amulet"
  | "boots"

export type ItemType =
  | "weapon"
  | "armor"
  | "helmet"
  | "ring"
  | "amulet"
  | "boots"

export type ItemEffect = {
  stat?: keyof Stats
  value?: number
  armorClassBonus?: number
  hpBonus?: number
  initiativeBonus?: number
}

export type Item = {
  id: string
  name: string
  type: ItemType
  allowedSlots: EquipmentSlot[]
  effects: ItemEffect[]
  
  weaponConfig?: {
    attackType: 'melee' | 'ranged'
    ability: keyof Stats
    damageDice: string
    damageBonus: number
    damageType: string
    notes: string
  }
}