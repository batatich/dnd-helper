import type { Stats } from './characters'
import type { Attack } from './attacks'
import type { Spell, SpellSlot } from './spells'
import type { CharacterItemForSheet } from './items'

export type AbilityName = keyof Stats

export type CharacterProfile = {
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

  createdAt: string
  updatedAt: string
}

export type SkillBonus = {
  name: string
  ability: AbilityName
  proficient: boolean
  expertise: boolean
  bonus: number
}

export type SavingThrowBonus = {
  ability: AbilityName
  label: string
  proficient: boolean
  bonus: number
}

export type CharacterSheetDeathSaves = {
  successes: number
  failures: number
}

export type CharacterSheetHitDice = {
  total: number
  used: number
  dice: string
}

export type HpIncrease = {
  id: string
  characterId: string
  level: number
  mode: 'fixed' | 'roll' | string
  value: number
  dice: string
  rolledValue: number | null
  createdAt: string
}

export type CharacterSheet = {
  character: CharacterProfile

  stats: {
    base: Stats
    final: Stats
    modifiers: Record<AbilityName, number>
  }

  derived: {
    maxHp: number
    armorClass: number
    initiative: number
    passivePerception: number
    proficiencyBonus: number
    spellAttackBonus: number | null
    spellSaveDc: number | null
  }

  deathSaves: CharacterSheetDeathSaves

  skills: SkillBonus[]
  savingThrows: SavingThrowBonus[]

  attacks: Attack[]

  magic: {
    spells: Spell[]
    spellSlots: SpellSlot[]
    spellcastingAbility: AbilityName | null
  }

  inventory: {
    items: CharacterItemForSheet[]
    equippedItems: CharacterItemForSheet[]
  }

  progression: {
    hitDice: CharacterSheetHitDice
    hpIncreases: HpIncrease[]
  }
}