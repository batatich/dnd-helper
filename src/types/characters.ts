export type Stats = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type DerivedStats = {
  maxHp: number
  armorClass: number
  initiative: number
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

export type SpellSlot = {
  level: number
  total: number
  used: number
}

export type Skill = {
  name: string
  attribute: keyof Stats
  proficient: boolean
}

export const standardSkills: Skill[] = [
  { name: 'Акробатика', attribute: 'dexterity', proficient: false },
  { name: 'Анализ', attribute: 'intelligence', proficient: false },
  { name: 'Атлетика', attribute: 'strength', proficient: false },
  { name: 'Внимание', attribute: 'wisdom', proficient: false },
  { name: 'Выживание', attribute: 'wisdom', proficient: false },
  { name: 'Выступление', attribute: 'charisma', proficient: false },
  { name: 'Запугивание', attribute: 'charisma', proficient: false },
  { name: 'История', attribute: 'intelligence', proficient: false },
  { name: 'Ловкость рук', attribute: 'dexterity', proficient: false },
  { name: 'Магия', attribute: 'intelligence', proficient: false },
  { name: 'Медицина', attribute: 'wisdom', proficient: false },
  { name: 'Обман', attribute: 'charisma', proficient: false },
  { name: 'Природа', attribute: 'intelligence', proficient: false },
  { name: 'Проницательность', attribute: 'wisdom', proficient: false },
  { name: 'Религия', attribute: 'intelligence', proficient: false },
  { name: 'Скрытность', attribute: 'dexterity', proficient: false },
  { name: 'Убеждение', attribute: 'charisma', proficient: false },
  { name: 'Уход за животными', attribute: 'wisdom', proficient: false },
]

export type Attack = {
  id: string
  name: string
  attackType: 'melee' | 'ranged' | 'spell'
  ability: keyof Stats
  proficient: boolean
  damageDice: string
  damageBonus: number
  damageType: string
  notes: string
  source: 'manual' | 'item'
  itemId?: string | null

  /**
   * Рассчитанные backend-поля.
   * Frontend их только отображает.
   */
  attackBonus: number
  damageBonusFinal: number
}

export type NewAttack = Omit<
  Attack,
  'id' | 'attackBonus' | 'damageBonusFinal'
>

export type AttackUpdate = Partial<NewAttack>

export type Spell = {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  duration: string
  components: string
  concentration: boolean
  ritual: boolean
  description: string
}

export type NewSpell = Omit<Spell, 'id'>

export type SpellUpdate = Partial<NewSpell>

export type SpellcastingAbility = keyof Stats

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
  inspiration: boolean
  speed: number

  spellcastingAbility: SpellcastingAbility | null

  deathSaves: DeathSaves
  hitDice: HitDice

  baseStats: Stats
  derivedStats: DerivedStats

  skills: Skill[]
  savingThrowProficiencies: (keyof Stats)[]

  attacks: Attack[]
  spells: Spell[]
  spellSlots: SpellSlot[]

  /**
   * Временный старый формат.
   * Позже заменим на CharacterItem[] из src/types/items.ts.
   */
  inventory: unknown[]

  /**
   * Временный старый формат.
   * Позже заменим на нормальную структуру экипировки / CharacterItem[].
   */
  equippedItems: Record<string, string | null>

  createdAt: string | Date
  updatedAt: string | Date

  /**
   * Старое фронтовое поле синхронизации.
   * Можно удалить позже, когда полностью уйдём от localStorage-модели.
   */
  isSynced?: boolean
}