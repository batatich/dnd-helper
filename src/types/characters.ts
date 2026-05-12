import type { CharacterItemForSheet } from './items'

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

/**
 * Legacy frontend skill list.
 *
 * Важно:
 * сейчас skills как итоговые бонусы уже должны приходить из backend sheet.
 * Этот список можно оставить только для старых UI-мест, форм или fallback.
 */
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
  characterId?: string
  name: string
  attackType: 'melee' | 'ranged' | 'spell'
  ability: keyof Stats
  proficient: boolean
  damageDice: string
  damageBonus: number
  damageType: string
  notes: string

  /**
   * Источник атаки.
   *
   * manual — создана пользователем.
   * item — сгенерирована backend-ом от экипированного предмета.
   *
   * Frontend не должен сам отправлять source при создании атаки.
   */
  source: 'manual' | 'item'

  /**
   * itemId есть только у item-based/generated attacks.
   * Frontend не должен сам отправлять itemId при создании ручной атаки.
   */
  itemId?: string | null

  /**
   * Рассчитанные backend-поля.
   * Frontend их только отображает.
   */
  attackBonus: number
  damageBonusFinal: number
}

/**
 * Payload для создания ручной атаки.
 *
 * Важно:
 * frontend НЕ отправляет:
 * - id
 * - source
 * - itemId
 * - attackBonus
 * - damageBonusFinal
 *
 * Эти поля выставляет или рассчитывает backend.
 */
export type NewAttack = Omit<
  Attack,
  | 'id'
  | 'characterId'
  | 'source'
  | 'itemId'
  | 'attackBonus'
  | 'damageBonusFinal'
>

/**
 * Payload для обновления ручной атаки.
 *
 * Тоже не содержит source/itemId/calculated fields.
 */
export type AttackUpdate = Partial<NewAttack>

export type Spell = {
  id: string
  characterId?: string

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

/**
 * Legacy Character type.
 *
 * Сейчас это переходный тип:
 * - часть UI всё ещё ожидает Character как "почти весь лист";
 * - настоящая backend-истина теперь лежит в CharacterSheet;
 * - characterStore временно маппит CharacterSheet -> Character.
 *
 * Позже этот тип можно будет сузить до профиля персонажа.
 */
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

  /**
   * Legacy skills.
   *
   * Для актуального листа лучше использовать sheet.skills,
   * где backend уже вернул bonus/proficient/expertise.
   */
  skills: Skill[]

  /**
   * Legacy saving throw proficiencies.
   *
   * Для актуального листа лучше использовать sheet.savingThrows.
   */
  savingThrowProficiencies: (keyof Stats)[]

  attacks: Attack[]
  spells: Spell[]
  spellSlots: SpellSlot[]

  /**
   * Inventory из backend sheet.
   *
   * Это уже не string[] и не unknown[].
   * UI не должен парсить notes, чтобы получить type/effects/allowedSlots.
   */
  inventory: CharacterItemForSheet[]

  /**
   * Legacy bridge для старого UI.
   *
   * Новый источник истины:
   * sheet.inventory.equippedItems
   *
   * Здесь пока оставляем Record, потому что часть UI может ожидать:
   * equippedItems.mainHand = itemId
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