import type {
  Attack,
  Character,
  Spell,
  SpellSlot,
  Stats,
} from './characters'
import type { CharacterItem } from './items'

export type AbilityName = keyof Stats

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
  createdAt: string | Date
}

export type CharacterSheet = {
  character: Character

  stats: {
    base: Stats
    final: Stats
    modifiers: Stats
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
    items: CharacterItem[]
    equippedItems: CharacterItem[]
  }

  progression: {
    hitDice: CharacterSheetHitDice
    hpIncreases: HpIncrease[]
  }
}