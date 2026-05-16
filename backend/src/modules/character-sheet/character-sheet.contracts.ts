import type { AbilityName } from '../calculation/stats.rules'

// =========================================================
// Entity contracts for CharacterSheetService
// =========================================================

export type CharacterEntity = {
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

  deathSaveSuccesses: number
  deathSaveFailures: number

  hitDiceUsed?: number | null

  spellcastingAbility?: AbilityName | string | null
  spellSlots?: unknown

  createdAt: Date
  updatedAt: Date

  hpIncreases?: CharacterHpIncreaseEntity[]
}

export type CharacterHpIncreaseEntity = {
  id: string
  characterId: string
  level: number
  mode: string
  value: number
  dice: string
  rolledValue: number | null
  createdAt: Date
}

export type CharacterStatsEntity = {
  characterId: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type CharacterAttackEntity = {
  id: string
  characterId: string
  name: string
  attackType: string | null
  ability: string | null
  proficient: boolean
  damageDice: string | null
  damageBonus: number | null
  damageType: string | null
  notes: string | null

  source?: string | null
  itemId?: string | null

  createdAt?: Date
  updatedAt?: Date
}

export type CharacterSpellEntity = {
  id: string
  characterId: string
  name: string
  level: number
  school: string | null
  castingTime: string | null
  range: string | null
  components: string | null
  duration: string | null
  description: string | null

  concentration?: boolean | null
  ritual?: boolean | null

  createdAt?: Date
  updatedAt?: Date
}

export type ItemTemplateEntity = {
  id: string
  name: string
  type: string | null
  slot: string | null
  description: string | null
  allowedSlots: unknown
  effects: unknown
  weaponConfig: unknown
  createdAt?: Date
  updatedAt?: Date
}

export type CharacterItemEntity = {
  id: string
  characterId: string
  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  equippedSlot: string | null
  notes: string | null
  itemTemplateId: string | null

  type: string | null
  allowedSlots: unknown
  effects: unknown
  weaponConfig: unknown

  itemTemplate?: ItemTemplateEntity | null
}

// =========================================================
// Repository contracts for CharacterSheetService
// =========================================================

export type CharacterRepository = {
  findByIdForSheet: (id: string) => Promise<CharacterEntity | null>
}

export type CharacterStatsRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterStatsEntity | null>
}

export type CharacterAttackRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterAttackEntity[]>
}

export type CharacterSpellRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterSpellEntity[]>
}

export type CharacterItemRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterItemEntity[]>
}