import type { Attack } from './attacks'
import type { Spell, SpellSlot } from './spells'
import type { CharacterItem, EquipmentSlot } from './items'

export type Stats = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type SpellcastingAbility = keyof Stats

export type DerivedStats = {
  maxHp: number
  armorClass: number
  initiative: number
}

export type Skill = {
  name: string
  attribute: keyof Stats
  proficient: boolean
}

export type DeathSaves = {
  successes: number
  failures: number
}

export type HitDice = {
  total: number
  used: number
  dice: string
}

export type EquippedItems = Record<EquipmentSlot, string | null>

export type Character = {
  id: string

  name: string
  race: string
  className: string
  level: number

  description: string | null
  alignment: string | null
  background: string | null
  avatarUrl: string | null

  currentHp: number
  temporaryHp: number
  speed: number
  inspiration: boolean
  spellcastingAbility: SpellcastingAbility | null

  baseStats?: Stats

  skills?: Skill[]
  attacks?: Attack[]
  spells?: Spell[]
  spellSlots?: SpellSlot[]

  currentStats?: Stats
  derivedStats?: DerivedStats
  savingThrowProficiencies?: (keyof Stats)[]
  deathSaves?: DeathSaves
  hitDice?: HitDice

  inventory?: CharacterItem[]
  equippedItems?: EquippedItems

  createdAt: string
  updatedAt: string
}

export const standardSkills: Skill[] = [
  { name: 'Атлетика', attribute: 'strength', proficient: false },
  { name: 'Акробатика', attribute: 'dexterity', proficient: false },
  { name: 'Ловкость рук', attribute: 'dexterity', proficient: false },
  { name: 'Скрытность', attribute: 'dexterity', proficient: false },
  { name: 'Магия', attribute: 'intelligence', proficient: false },
  { name: 'История', attribute: 'intelligence', proficient: false },
  { name: 'Расследование', attribute: 'intelligence', proficient: false },
  { name: 'Природа', attribute: 'intelligence', proficient: false },
  { name: 'Религия', attribute: 'intelligence', proficient: false },
  { name: 'Уход за животными', attribute: 'wisdom', proficient: false },
  { name: 'Проницательность', attribute: 'wisdom', proficient: false },
  { name: 'Медицина', attribute: 'wisdom', proficient: false },
  { name: 'Восприятие', attribute: 'wisdom', proficient: false },
  { name: 'Выживание', attribute: 'wisdom', proficient: false },
  { name: 'Обман', attribute: 'charisma', proficient: false },
  { name: 'Запугивание', attribute: 'charisma', proficient: false },
  { name: 'Выступление', attribute: 'charisma', proficient: false },
  { name: 'Убеждение', attribute: 'charisma', proficient: false },
]

export type { Attack, NewAttack } from './attacks'
export type { NewSpell, Spell, SpellSlot } from './spells'
