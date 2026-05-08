import { CharacterNotFoundError } from '../characters/errors'
import { calculateHitDice, calculateMaxHp } from '../calculation/hp.rules'

import type { AbilityName, AbilityScores } from '../calculation/stats.rules'
import { getAbilityModifiers } from '../calculation/stats.rules'

import type { SkillBonus } from '../calculation/skills.rules'
import {
  calculatePassivePerception,
  calculateSkillBonuses,
} from '../calculation/skills.rules'

import type { SavingThrowBonus } from '../calculation/saving-throws.rules'
import { calculateSavingThrows } from '../calculation/saving-throws.rules'

// =========================================================
// 1. Базовые типы character sheet
// =========================================================

type AbilityModifiers = AbilityScores

type AttackType = 'melee' | 'ranged' | 'spell'

type AttackSource = 'manual' | 'item'

type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'body'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'boots'

type ItemEffectDto = {
  stat?: AbilityName
  value?: number
  armorClassBonus?: number
  hpBonus?: number
  initiativeBonus?: number
}

type WeaponConfigDto = {
  attackType: 'melee' | 'ranged'
  ability: AbilityName
  damageDice: string
  damageBonus: number
  damageType: string
  notes: string
}

// =========================================================
// 2. Сущность персонажа для сборки sheet
// =========================================================

type CharacterEntity = {
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

// =========================================================
// 3. История прироста HP
// =========================================================

type CharacterHpIncreaseEntity = {
  id: string
  characterId: string
  level: number
  mode: string
  value: number
  dice: string
  rolledValue: number | null
  createdAt: Date
}

// =========================================================
// 4. Базовые характеристики персонажа
// =========================================================

type CharacterStatsEntity = {
  characterId: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

type DeathSavesDto = {
  successes: number
  failures: number
}

// =========================================================
// 5. Атаки персонажа
// =========================================================

type CharacterAttackEntity = {
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

type AttackDto = {
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

// =========================================================
// 6. Заклинания персонажа
// =========================================================

type CharacterSpellEntity = {
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

type SpellDto = {
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

// =========================================================
// 7. Предметы персонажа
// =========================================================

type ItemTemplateEntity = {
  id: string
  name: string
  type: string | null
  slot: string | null
  description: string | null
  effects: unknown
  createdAt?: Date
  updatedAt?: Date
}

type CharacterItemEntity = {
  id: string
  characterId: string
  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  slot: string | null
  notes: string | null
  itemTemplateId: string | null
  itemTemplate?: ItemTemplateEntity | null
}

type CharacterItemDto = {
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

// =========================================================
// 8. Repository-контракты
// =========================================================

type CharacterRepository = {
  findById: (id: string) => Promise<CharacterEntity | null>
  findByIdForSheet?: (id: string) => Promise<CharacterEntity | null>
}

type CharacterStatsRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterStatsEntity | null>
}

type CharacterAttackRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterAttackEntity[]>
}

type CharacterSpellRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterSpellEntity[]>
}

type CharacterItemRepository = {
  findByCharacterId: (characterId: string) => Promise<CharacterItemEntity[]>
}

// =========================================================
// 9. DTO готового character sheet
// =========================================================

type CharacterProfileDto = {
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

type CharacterStatsDto = {
  base: AbilityScores
  final: AbilityScores
  modifiers: AbilityModifiers
}

type CharacterDerivedDto = {
  maxHp: number
  armorClass: number
  initiative: number
  passivePerception: number
  proficiencyBonus: number
  spellAttackBonus: number | null
  spellSaveDc: number | null
}

type CharacterSheetDto = {
  character: CharacterProfileDto

  stats: CharacterStatsDto

  derived: CharacterDerivedDto

  deathSaves: DeathSavesDto

  skills: SkillBonus[]

  savingThrows: SavingThrowBonus[]

  attacks: AttackDto[]

  magic: {
    spells: SpellDto[]
    spellSlots: unknown[]
    spellcastingAbility: AbilityName | null
  }

  inventory: {
    items: CharacterItemDto[]
    equippedItems: CharacterItemDto[]
  }

  progression: {
    hitDice: ReturnType<typeof calculateHitDice>
    hpIncreases: CharacterHpIncreaseEntity[]
  }
}

// =========================================================
// 10. CharacterSheetService
// =========================================================

export class CharacterSheetService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterStatsRepository: CharacterStatsRepository,
    private readonly attackRepository: CharacterAttackRepository,
    private readonly spellRepository: CharacterSpellRepository,
    private readonly itemRepository: CharacterItemRepository,
  ) {}

  async getCharacterSheet(characterId: string): Promise<CharacterSheetDto> {
    const character = await this.getCharacterForSheet(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const baseStatsEntity = await this.getStats(characterId)

    const [attacks, spells, items] = await Promise.all([
      this.attackRepository.findByCharacterId(characterId),
      this.spellRepository.findByCharacterId(characterId),
      this.itemRepository.findByCharacterId(characterId),
    ])

    const inventoryItems = items.map((item) => this.toCharacterItemDto(item))
    const equippedItems = inventoryItems.filter((item) => item.isEquipped)

    const baseStats = this.toAbilityScores(baseStatsEntity)

    const finalStats = this.calculateFinalStats(baseStats, equippedItems)

    const modifiers = getAbilityModifiers(finalStats)

    const proficiencyBonus = this.calculateProficiencyBonus(character.level)

    const skills = calculateSkillBonuses({
      modifiers,
      proficiencyBonus,
      skillStates: [],
    })

    const savingThrows = calculateSavingThrows({
      modifiers,
      proficiencyBonus,
      savingThrowStates: [],
    })

    const hpIncreases = character.hpIncreases ?? []

    const characterForHpCalculation = {
      ...character,
      stats: baseStatsEntity,
      hpIncreases,
    }

    const derived = this.calculateDerived({
      character,
      modifiers,
      maxHp: calculateMaxHp(characterForHpCalculation),
      proficiencyBonus,
      passivePerception: calculatePassivePerception(skills),
      equippedItems,
    })

    const hitDice = calculateHitDice(characterForHpCalculation)

    const manualAttacks = attacks.map((attack) =>
      this.toAttackDto(attack, modifiers, proficiencyBonus),
    )
    const generatedWeaponAttacks = this.createGeneratedWeaponAttacks(
      character.id,
      equippedItems,
      modifiers,
      proficiencyBonus,
    )
    return {
      character: this.toCharacterProfileDto(character),

      stats: {
        base: baseStats,
        final: finalStats,
        modifiers,
      },

      derived,

      deathSaves: {
        successes: character.deathSaveSuccesses,
        failures: character.deathSaveFailures,
      },

      skills,
      savingThrows,

      attacks: [...manualAttacks, ...generatedWeaponAttacks],

      magic: {
        spells: spells.map((spell) => this.toSpellDto(spell)),
        spellSlots: this.normalizeSpellSlots(character.spellSlots),
        spellcastingAbility: this.normalizeAbilityName(
          character.spellcastingAbility,
        ),
      },

      inventory: {
        items: inventoryItems,
        equippedItems,
      },
      progression: {
        hitDice,
        hpIncreases,
      },
    }
  }

  // =======================================================
  // Character loading
  // =======================================================

  private getCharacterForSheet(
    characterId: string,
  ): Promise<CharacterEntity | null> {
    if (this.characterRepository.findByIdForSheet) {
      return this.characterRepository.findByIdForSheet(characterId)
    }

    return this.characterRepository.findById(characterId)
  }

  // =======================================================
  // Stats loading
  // =======================================================

  private async getStats(characterId: string): Promise<CharacterStatsEntity> {
    const stats = await this.characterStatsRepository.findByCharacterId(
      characterId,
    )

    if (!stats) {
      return {
        characterId,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      }
    }

    return stats
  }

  // =======================================================
  // DTO builders
  // =======================================================

  private toCharacterProfileDto(
    character: CharacterEntity,
  ): CharacterProfileDto {
    return {
      id: character.id,
      name: character.name,
      race: character.race,
      className: character.className,
      level: character.level,

      description: character.description,
      alignment: character.alignment,
      background: character.background,
      avatarUrl: character.avatarUrl,

      currentHp: character.currentHp,
      temporaryHp: character.temporaryHp,
      speed: character.speed,
      inspiration: character.inspiration,

      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    }
  }

  private toAttackDto(
    attack: CharacterAttackEntity,
    modifiers: AbilityModifiers,
    proficiencyBonus: number,
  ): AttackDto {
    const ability = this.normalizeAttackAbility(attack.ability)
    const abilityModifier = modifiers[ability]

    const baseDamageBonus = attack.damageBonus ?? 0

    const attackBonus =
      abilityModifier + (attack.proficient ? proficiencyBonus : 0)

    const damageBonusFinal = baseDamageBonus + abilityModifier

    return {
      id: attack.id,
      characterId: attack.characterId,
      name: attack.name,
      attackType: this.normalizeAttackType(attack.attackType),
      ability,
      proficient: attack.proficient,
      damageDice: attack.damageDice ?? '',
      damageBonus: baseDamageBonus,
      attackBonus,
      damageBonusFinal,
      damageType: attack.damageType ?? '',
      notes: attack.notes ?? '',
      source: this.normalizeAttackSource(attack.source),
      itemId: attack.itemId ?? null,
    }
  }

  private toSpellDto(spell: CharacterSpellEntity): SpellDto {
    return {
      id: spell.id,
      characterId: spell.characterId,
      name: spell.name,
      level: spell.level,
      school: spell.school ?? '',
      castingTime: spell.castingTime ?? '',
      range: spell.range ?? '',
      components: spell.components ?? '',
      duration: spell.duration ?? '',
      concentration: spell.concentration ?? false,
      ritual: spell.ritual ?? false,
      description: spell.description ?? '',
    }
  }

  private toCharacterItemDto(item: CharacterItemEntity): CharacterItemDto {
    const template = item.itemTemplate ?? null
    const parsedNotes = this.parseItemNotes(item.notes)

    const type = template?.type ?? parsedNotes.type ?? 'misc'

    const effectsFromTemplate = this.normalizeItemEffects(template?.effects)
    const effectsFromNotes = this.normalizeItemEffects(parsedNotes.effects)

    const allowedSlotsFromTemplate = this.normalizeAllowedSlots(template?.slot)
    const allowedSlotsFromNotes = this.normalizeAllowedSlots(
      parsedNotes.allowedSlots,
    )

    return {
      id: item.id,
      itemId: item.id,
      name: item.nameSnapshot || template?.name || 'Предмет',
      type,
      effects:
        effectsFromTemplate.length > 0 ? effectsFromTemplate : effectsFromNotes,
      allowedSlots:
        allowedSlotsFromTemplate.length > 0
          ? allowedSlotsFromTemplate
          : allowedSlotsFromNotes,
      isEquipped: item.isEquipped,
      equippedSlot: this.normalizeEquipmentSlot(item.slot),
      quantity: item.quantity,
      notes: item.notes,
      weaponConfig: this.normalizeWeaponConfig(parsedNotes.weaponConfig),
    }
  }

  private toAbilityScores(stats: CharacterStatsEntity): AbilityScores {
    return {
      strength: stats.strength,
      dexterity: stats.dexterity,
      constitution: stats.constitution,
      intelligence: stats.intelligence,
      wisdom: stats.wisdom,
      charisma: stats.charisma,
    }
  }

  private createGeneratedWeaponAttacks(
    characterId: string,
    equippedItems: CharacterItemDto[],
    modifiers: AbilityModifiers,
    proficiencyBonus: number,
  ): AttackDto[] {
    return equippedItems
      .filter((item) => item.weaponConfig)
      .map((item) => {
        const weaponConfig = item.weaponConfig!

        const abilityModifier = modifiers[weaponConfig.ability]
        const baseDamageBonus = weaponConfig.damageBonus

        const attackBonus = abilityModifier + proficiencyBonus
        const damageBonusFinal = baseDamageBonus + abilityModifier

        return {
          id: `item-${item.itemId}`,
          characterId,
          name: item.name,
          attackType: weaponConfig.attackType,
          ability: weaponConfig.ability,
          proficient: true,
          damageDice: weaponConfig.damageDice,
          damageBonus: baseDamageBonus,
          attackBonus,
          damageBonusFinal,
          damageType: weaponConfig.damageType,
          notes: weaponConfig.notes,
          source: 'item',
          itemId: item.itemId,
        }
      })
  }

  // =======================================================
  // Inventory helpers
  // =======================================================

  private parseItemNotes(notes: string | null): {
    type?: string
    allowedSlots?: unknown
    effects?: unknown
    weaponConfig?: unknown
  } {
    if (!notes) {
      return {}
    }

    try {
      const parsed: unknown = JSON.parse(notes)

      if (!parsed || typeof parsed !== 'object') {
        return {}
      }

      return parsed as {
        type?: string
        allowedSlots?: unknown
        effects?: unknown
        weaponConfig?: unknown
      }
    } catch {
      return {}
    }
  }

  private normalizeEquipmentSlot(slot: unknown): EquipmentSlot | null {
    if (
      slot === 'mainHand' ||
      slot === 'offHand' ||
      slot === 'head' ||
      slot === 'body' ||
      slot === 'ring1' ||
      slot === 'ring2' ||
      slot === 'amulet' ||
      slot === 'boots'
    ) {
      return slot
    }

    return null
  }

  private normalizeAllowedSlots(value: unknown): EquipmentSlot[] {
    if (!value) {
      return []
    }

    if (typeof value === 'string') {
      const slot = this.normalizeEquipmentSlot(value)
      return slot ? [slot] : []
    }

    if (Array.isArray(value)) {
      return value
        .map((slot) => this.normalizeEquipmentSlot(slot))
        .filter((slot): slot is EquipmentSlot => slot !== null)
    }

    return []
  }

  private normalizeItemEffects(value: unknown): ItemEffectDto[] {
    if (!Array.isArray(value)) {
      return []
    }

    return value
      .map((effect) => this.normalizeItemEffect(effect))
      .filter((effect): effect is ItemEffectDto => effect !== null)
  }

  private normalizeItemEffect(effect: unknown): ItemEffectDto | null {
    if (!effect || typeof effect !== 'object') {
      return null
    }

    const rawEffect = effect as {
      stat?: unknown
      value?: unknown
      armorClassBonus?: unknown
      hpBonus?: unknown
      initiativeBonus?: unknown
    }

    const normalized: ItemEffectDto = {}

    const stat =
      typeof rawEffect.stat === 'string'
        ? this.normalizeAbilityName(rawEffect.stat)
        : null

    if (stat) {
      normalized.stat = stat
    }

    if (typeof rawEffect.value === 'number') {
      normalized.value = rawEffect.value
    }

    if (typeof rawEffect.armorClassBonus === 'number') {
      normalized.armorClassBonus = rawEffect.armorClassBonus
    }

    if (typeof rawEffect.hpBonus === 'number') {
      normalized.hpBonus = rawEffect.hpBonus
    }

    if (typeof rawEffect.initiativeBonus === 'number') {
      normalized.initiativeBonus = rawEffect.initiativeBonus
    }

    return Object.keys(normalized).length > 0 ? normalized : null
  }

  private normalizeWeaponConfig(value: unknown): WeaponConfigDto | undefined {
    if (!value || typeof value !== 'object') {
      return undefined
    }

    const rawConfig = value as {
      attackType?: unknown
      ability?: unknown
      damageDice?: unknown
      damageBonus?: unknown
      damageType?: unknown
      notes?: unknown
    }

    const attackType =
      rawConfig.attackType === 'ranged' || rawConfig.attackType === 'melee'
        ? rawConfig.attackType
        : 'melee'

    return {
      attackType,
      ability: this.normalizeAttackAbility(
        typeof rawConfig.ability === 'string' ? rawConfig.ability : null,
      ),
      damageDice:
        typeof rawConfig.damageDice === 'string' ? rawConfig.damageDice : '',
      damageBonus:
        typeof rawConfig.damageBonus === 'number' ? rawConfig.damageBonus : 0,
      damageType:
        typeof rawConfig.damageType === 'string' ? rawConfig.damageType : '',
      notes: typeof rawConfig.notes === 'string' ? rawConfig.notes : '',
    }
  }

  // =======================================================
  // Calculation: final stats
  // =======================================================

  private calculateFinalStats(
    baseStats: AbilityScores,
    equippedItems: CharacterItemDto[],
  ): AbilityScores {
    const finalStats: AbilityScores = {
      ...baseStats,
    }

    for (const item of equippedItems) {
      for (const effect of item.effects) {
        if (!effect.stat || typeof effect.value !== 'number') {
          continue
        }

        finalStats[effect.stat] += effect.value
      }
    }

    return finalStats
  }

  private calculateItemDerivedBonuses(equippedItems: CharacterItemDto[]): {
    armorClassBonus: number
    hpBonus: number
    initiativeBonus: number
  } {
    const bonuses = {
      armorClassBonus: 0,
      hpBonus: 0,
      initiativeBonus: 0,
    }

    for (const item of equippedItems) {
      for (const effect of item.effects) {
        if (typeof effect.armorClassBonus === 'number') {
          bonuses.armorClassBonus += effect.armorClassBonus
        }

        if (typeof effect.hpBonus === 'number') {
          bonuses.hpBonus += effect.hpBonus
        }

        if (typeof effect.initiativeBonus === 'number') {
          bonuses.initiativeBonus += effect.initiativeBonus
        }
      }
    }

    return bonuses
  }

  // =======================================================
  // Calculation: derived values
  // =======================================================

  private calculateDerived(input: {
    character: CharacterEntity
    modifiers: AbilityModifiers
    maxHp: number
    proficiencyBonus: number
    passivePerception: number
    equippedItems: CharacterItemDto[]
  }): CharacterDerivedDto {
    const {
      character,
      modifiers,
      maxHp,
      proficiencyBonus,
      passivePerception,
      equippedItems,
    } = input

    const spellcastingAbility = this.normalizeAbilityName(
      character.spellcastingAbility,
    )

    const spellcastingModifier = spellcastingAbility
      ? modifiers[spellcastingAbility]
      : null

    const itemDerivedBonuses = this.calculateItemDerivedBonuses(equippedItems)

    const finalMaxHp = maxHp + itemDerivedBonuses.hpBonus

    const finalArmorClass =
      10 + modifiers.dexterity + itemDerivedBonuses.armorClassBonus

    const finalInitiative =
      modifiers.dexterity + itemDerivedBonuses.initiativeBonus

    return {
      maxHp: finalMaxHp,
      armorClass: finalArmorClass,
      initiative: finalInitiative,
      passivePerception,
      proficiencyBonus,

      spellAttackBonus:
        spellcastingModifier === null
          ? null
          : spellcastingModifier + proficiencyBonus,

      spellSaveDc:
        spellcastingModifier === null
          ? null
          : 8 + spellcastingModifier + proficiencyBonus,
    }
  }

  // =======================================================
  // Calculation: proficiency bonus
  // =======================================================

  private calculateProficiencyBonus(level: number): number {
    const safeLevel = Math.min(Math.max(level, 1), 20)

    return Math.ceil(safeLevel / 4) + 1
  }

  // =======================================================
  // Attack helpers
  // =======================================================

  private normalizeAttackType(attackType: string | null): AttackType {
    if (
      attackType === 'melee' ||
      attackType === 'ranged' ||
      attackType === 'spell'
    ) {
      return attackType
    }

    return 'melee'
  }

  private normalizeAttackSource(
    source: string | null | undefined,
  ): AttackSource {
    if (source === 'item') {
      return 'item'
    }

    return 'manual'
  }

  private normalizeAttackAbility(
    ability: string | null | undefined,
  ): AbilityName {
    return this.normalizeAbilityName(ability) ?? 'strength'
  }

  // =======================================================
  // Spell helpers
  // =======================================================

  private normalizeAbilityName(
    ability: AbilityName | string | null | undefined,
  ): AbilityName | null {
    if (
      ability === 'strength' ||
      ability === 'dexterity' ||
      ability === 'constitution' ||
      ability === 'intelligence' ||
      ability === 'wisdom' ||
      ability === 'charisma'
    ) {
      return ability
    }

    return null
  }

  private normalizeSpellSlots(spellSlots: unknown): unknown[] {
    if (Array.isArray(spellSlots)) {
      return spellSlots
    }

    return []
  }
}