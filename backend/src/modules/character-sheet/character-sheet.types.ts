import type { ItemEffectDto } from '../calculation/item-effects.rules'
import type { SkillBonus } from '../calculation/skills.rules'
import type { SavingThrowBonus } from '../calculation/saving-throws.rules'
import type { AbilityName, AbilityScores } from '../calculation/stats.rules'

// =========================================================
// Shared character-sheet DTO helpers
// =========================================================

export type AbilityModifiers = AbilityScores

export type AttackType = 'melee' | 'ranged' | 'spell'

export type AttackSource = 'manual' | 'item'

export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'boots'

export type WeaponConfigDto = {
  attackType: 'melee' | 'ranged'
  ability: AbilityName
  damageDice: string
  damageBonus: number
  damageType: string
  notes: string
}

// =========================================================
// Character sheet output DTO
// =========================================================

export type CharacterProfileDto = {
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

  createdAt: Date
  updatedAt: Date
}

export type CharacterStatsDto = {
  base: AbilityScores
  final: AbilityScores
  modifiers: AbilityModifiers
}

export type CharacterDerivedDto = {
  maxHp: number
  armorClass: number
  initiative: number
  passivePerception: number
  proficiencyBonus: number
  spellAttackBonus: number | null
  spellSaveDc: number | null
}

export type DeathSavesDto = {
  successes: number
  failures: number
}

export type AttackDto = {
  id: string
  characterId: string
  name: string
  attackType: AttackType
  ability: AbilityName
  proficient: boolean
  damageDice: string

  /**
   * Базовый бонус урона, который хранится у атаки.
   */
  damageBonus: number

  /**
   * Финальный бонус к броску атаки:
   * ability modifier + proficiencyBonus, если proficient = true.
   */
  attackBonus: number

  /**
   * Финальный бонус к урону:
   * damageBonus + ability modifier.
   */
  damageBonusFinal: number

  damageType: string
  notes: string
  source: AttackSource
  itemId: string | null
}

export type SpellDto = {
  id: string
  characterId: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  concentration: boolean
  ritual: boolean
  description: string
}

export type SpellSlotDto = {
  level: number
  total: number
  used: number
}

export type CharacterItemDto = {
  id: string
  itemId: string
  name: string
  type: string | null
  effects: ItemEffectDto[]
  allowedSlots: EquipmentSlot[]
  isEquipped: boolean
  equippedSlot: EquipmentSlot | null
  quantity: number
  notes: string | null
  weaponConfig?: WeaponConfigDto
}

export type CharacterInventoryDto = {
  items: CharacterItemDto[]
  equippedItems: CharacterItemDto[]
}

export type CharacterHpIncreaseDto = {
  id: string
  characterId: string
  level: number
  mode: string
  value: number
  dice: string
  rolledValue: number | null
  createdAt: Date
}

export type HitDiceDto = {
  total: number
  used: number
  dice: string
}

export type CharacterProgressionDto = {
  hitDice: HitDiceDto
  hpIncreases: CharacterHpIncreaseDto[]
}

export type CharacterMagicDto = {
  spells: SpellDto[]
  spellSlots: SpellSlotDto[]
  spellcastingAbility: AbilityName | null
}

export type CharacterSheetDto = {
  character: CharacterProfileDto

  stats: CharacterStatsDto

  derived: CharacterDerivedDto

  deathSaves: DeathSavesDto

  skills: SkillBonus[]

  savingThrows: SavingThrowBonus[]

  attacks: AttackDto[]

  magic: CharacterMagicDto

  inventory: CharacterInventoryDto

  progression: CharacterProgressionDto
}