import type { Stats } from './characters'

/**
 * Слот экипировки.
 *
 * allowedSlots = куда предмет можно надеть.
 * equippedSlot = куда конкретный предмет сейчас надет.
 */
export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'boots'

/**
 * Тип предмета.
 *
 * ItemType оставляем расширяемым через `ItemType | string`,
 * потому что backend может вернуть кастомный тип.
 */
export type ItemType =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'helmet'
  | 'ring'
  | 'amulet'
  | 'boots'
  | 'consumable'
  | 'misc'

/**
 * Эффект предмета.
 *
 * Эти эффекты применяются backend-ом к sheet:
 * - stat/value влияет на stats.final
 * - armorClassBonus влияет на derived.armorClass
 * - hpBonus влияет на derived.maxHp
 * - initiativeBonus влияет на derived.initiative
 */
export type ItemEffect = {
  stat?: keyof Stats
  value?: number
  armorClassBonus?: number
  hpBonus?: number
  initiativeBonus?: number
}

/**
 * Настройки оружия.
 *
 * Используется backend-ом для generated attacks от экипированного оружия.
 */
export type WeaponConfig = {
  attackType: 'melee' | 'ranged'
  ability: keyof Stats
  damageDice: string
  damageBonus: number
  damageType: string
  notes: string
}

export type ItemWeaponConfigResponse = {
  attackType?: 'melee' | 'ranged' | 'spell'
  ability?: keyof Stats
  damageDice?: string
  damageBonus?: number
  damageType?: string
  notes?: string | null
}

export type ItemTemplateResponse = {
  id: string
  name: string
  type: ItemType | string | null
  slot: EquipmentSlot | string | null
  description: string | null
  allowedSlots: EquipmentSlot[] | null
  effects: ItemEffect[] | null
  weaponConfig: ItemWeaponConfigResponse | null
  createdAt: string
  updatedAt: string
}

export type CharacterItemResponse = {
  id: string
  characterId: string
  itemTemplateId: string | null
  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  equippedSlot: EquipmentSlot | string | null
  notes: string | null
  type: ItemType | string | null
  allowedSlots: EquipmentSlot[] | null
  effects: ItemEffect[] | null
  weaponConfig: ItemWeaponConfigResponse | null
  createdAt: string
  updatedAt: string
  itemTemplate: ItemTemplateResponse | null
}

/**
 * Старый frontend-тип предмета.
 *
 * Можно оставить для локальных форм, справочника и старых UI-мест.
 * Но для character sheet лучше использовать CharacterItemForSheet.
 */
export type Item = {
  id: string
  name: string
  type: ItemType | string
  allowedSlots: EquipmentSlot[]
  effects: ItemEffect[]
  weaponConfig?: WeaponConfig | null
}

/**
 * Backend-шаблон предмета.
 *
 * Соответствует ItemTemplate.
 *
 * Важно:
 * - slot оставляем, потому что ItemTemplate.slot не переименовывали;
 * - allowedSlots — новый правильный список допустимых слотов;
 * - weaponConfig нужен для генерации атак от оружия;
 * - effects должен приходить как игровые эффекты шаблона.
 */
export type ItemTemplate = {
  id: string
  name: string

  type: ItemType | string | null

  /**
   * Legacy/fallback поле шаблона.
   * Это НЕ текущий слот экипировки персонажа.
   */
  slot: EquipmentSlot | string | null

  /**
   * Основной список допустимых слотов.
   */
  allowedSlots?: EquipmentSlot[] | null

  description?: string | null
  effects?: ItemEffect[] | null
  weaponConfig?: WeaponConfig | null

  createdAt?: string | Date
  updatedAt?: string | Date
}

/**
 * Сырая сущность предмета персонажа.
 *
 * Это ближе к Prisma CharacterItem + itemTemplate.
 *
 * Важно:
 * - slot здесь больше нет;
 * - текущий слот экипировки называется equippedSlot;
 * - type/allowedSlots/effects/weaponConfig могут жить прямо в CharacterItem,
 *   если предмет кастомный и не имеет полноценного ItemTemplate.
 */
export type CharacterItem = {
  id: string
  characterId?: string
  itemTemplateId?: string | null

  nameSnapshot?: string | null
  quantity: number

  isEquipped: boolean
  equippedSlot: EquipmentSlot | string | null
  slot?: any

  notes: string | null

  /**
   * Игровые поля кастомного предмета.
   * Приоритет источников:
   * 1. CharacterItem
   * 2. ItemTemplate
   * 3. fallback
   */
  type?: ItemType | string | null
  allowedSlots?: EquipmentSlot[] | null
  effects?: ItemEffect[] | null
  weaponConfig?: WeaponConfig | null

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
 * Должен совпадать с backend CharacterItemDto.
 *
 * Использовать в CharacterSheet / inventory UI.
 *
 * Важно:
 * - itemId здесь string, потому что backend кладёт item.id;
 * - effects уже нормализованы в массив;
 * - allowedSlots уже нормализованы в массив слотов;
 * - equippedSlot уже нормализован или null;
 * - notes остаётся обычной заметкой;
 * - UI больше не должен парсить notes ради type/effects/allowedSlots.
 */
export type CharacterItemForSheet = {
  id: string
  itemId: string
  characterId?: string
  itemTemplateId?: string | null
  nameSnapshot?: string | null
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
