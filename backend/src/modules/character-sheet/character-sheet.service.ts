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
// CharacterSheetService не должен сам объявлять правила
// характеристик. AbilityName / AbilityScores берём из
// calculation/stats.rules.ts.
//
// Это важно, чтобы весь backend использовал один общий
// источник типов и формул для характеристик.
// =========================================================

type AbilityModifiers = AbilityScores

// =========================================================
// 2. Сущность персонажа для сборки sheet
// =========================================================
// Здесь лежат только поля, которые нужны для листа.
// Это НЕ обязательно Prisma-тип 1-в-1.
// Это service-contract: какие данные нужны,
// чтобы собрать готовый CharacterSheetDto.
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

  // Использование костей хитов.
  // total и dice считаются сервером,
  // used хранится как состояние персонажа.
  hitDiceUsed?: number | null

  // Способность заклинателя.
  // Сейчас может отсутствовать у персонажа.
  // Тогда spellAttackBonus / spellSaveDc будут null.
  spellcastingAbility?: AbilityName | string | null

  // Spell slots хранятся в Character как JSON/поле.
  // Service возвращает их в magic.spellSlots.
  spellSlots?: unknown

  createdAt: Date
  updatedAt: Date

  // История прироста HP по уровням.
  // Нужна для расчёта maxHp.
  hpIncreases?: CharacterHpIncreaseEntity[]
}

// =========================================================
// 3. История прироста HP
// =========================================================
// Каждая запись показывает, сколько HP персонаж получил
// при повышении конкретного уровня.
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
// Это хранимые значения.
// Они не учитывают предметы и временные эффекты.
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
// Это сохранённые атаки.
// Позже сюда можно будет добавить calculatedAttackBonus,
// calculatedDamageBonus или generated item attacks.
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
}

// =========================================================
// 6. Заклинания персонажа
// =========================================================
// Это сохранённые spell-записи.
// Spell slots возвращаются отдельно через magic.spellSlots.
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
}

// =========================================================
// 7. Предметы персонажа
// =========================================================
// itemTemplate пока unknown, потому что эффекты предметов
// ещё не типизированы как полноценная backend-модель.
// Когда будем переносить item effects, это нужно заменить
// на нормальный ItemTemplateEntity.
// =========================================================

type CharacterItemEntity = {
  id: string
  characterId: string
  nameSnapshot: string
  quantity: number
  isEquipped: boolean
  slot: string | null
  notes: string | null
  itemTemplateId: string | null
  itemTemplate?: unknown
}

// =========================================================
// 8. Repository-контракты
// =========================================================
// Service не знает Prisma напрямую.
// Он просит данные через repository-интерфейсы.
//
// findByIdForSheet — предпочтительный метод.
// Он должен подтягивать hpIncreases.
// findById — fallback для совместимости.
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
// Это уже не Prisma-сущность, а готовый ответ API.
// Именно эту структуру должен получать frontend.
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
  // Хранимые базовые характеристики.
  base: AbilityScores

  // Итоговые характеристики.
  // Сейчас равны base.
  // Позже сюда будут применяться item effects.
  final: AbilityScores

  // Модификаторы от итоговых характеристик.
  modifiers: AbilityModifiers
}

type CharacterDerivedDto = {
  // Максимальное HP считается сервером.
  maxHp: number

  // Броня.
  // Сейчас: 10 + DEX modifier.
  // Позже: armor/shield/item effects.
  armorClass: number

  // Инициатива.
  // Сейчас: DEX modifier.
  initiative: number

  // Пассивная внимательность / восприятие.
  // Теперь считается через skills.rules.ts.
  passivePerception: number

  // Бонус мастерства по уровню.
  proficiencyBonus: number

  // Spell values.
  // null означает, что у персонажа нет выбранной spellcasting ability.
  spellAttackBonus: number | null
  spellSaveDc: number | null
}

type CharacterSheetDto = {
  // Базовый профиль персонажа.
  character: CharacterProfileDto

  // Характеристики и модификаторы.
  stats: CharacterStatsDto

  // Производные значения.
  derived: CharacterDerivedDto

  deathSaves: DeathSavesDto
  // Навыки.
  // Считаются backend-ом через calculation/skills.rules.ts.
  skills: SkillBonus[]

  // Спасброски.
  // Считаются backend-ом через calculation/saving-throws.rules.ts.
  savingThrows: SavingThrowBonus[]

  // Боевой блок.
  attacks: CharacterAttackEntity[]

  // Магический блок.
  magic: {
    spells: CharacterSpellEntity[]
    spellSlots: unknown[]
    spellcastingAbility: AbilityName | null
  }

  // Инвентарь.
  inventory: {
    items: CharacterItemEntity[]
    equippedItems: CharacterItemEntity[]
  }

  // Развитие персонажа.
  progression: {
    hitDice: ReturnType<typeof calculateHitDice>
    hpIncreases: CharacterHpIncreaseEntity[]
  }
}

// =========================================================
// 10. CharacterSheetService
// =========================================================
// Главная задача:
// собрать готовый character sheet из нескольких источников.
//
// Service отвечает за:
// - получение данных через repositories
// - безопасную сборку DTO
// - вызов calculation rules
//
// Service НЕ должен:
// - работать с Prisma напрямую
// - знать HTTP/Fastify
// - хранить правила навыков/спасбросков внутри себя
// - отдавать frontend неполный набор, который тот должен склеивать сам
// =========================================================

export class CharacterSheetService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterStatsRepository: CharacterStatsRepository,
    private readonly attackRepository: CharacterAttackRepository,
    private readonly spellRepository: CharacterSpellRepository,
    private readonly itemRepository: CharacterItemRepository,
  ) {}

  // =======================================================
  // Public API
  // =======================================================
  // Получить полный character sheet.
  //
  // Это главный метод для:
  // GET /characters/:id/sheet
  //
  // Возвращает вложенную структуру:
  // {
  //   character,
  //   stats,
  //   derived,
  //   skills,
  //   savingThrows,
  //   attacks,
  //   magic,
  //   inventory,
  //   progression
  // }
  // =======================================================

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

    const equippedItems = this.getEquippedItems(items)

    const baseStats = this.toAbilityScores(baseStatsEntity)

    // Сейчас finalStats равны baseStats.
    // Позже именно здесь будет применяться логика item effects:
    // finalStats = applyItemEffects(baseStats, equippedItems)
    const finalStats = this.calculateFinalStats(baseStats, equippedItems)

    // Модификаторы теперь считаются общим calculation helper-ом.
    const modifiers = getAbilityModifiers(finalStats)

    const proficiencyBonus = this.calculateProficiencyBonus(character.level)

    // Пока skillStates не подключены к БД.
    // Поэтому все proficiencies будут false.
    // Позже сюда можно будет передать CharacterSkillState[].
    const skills = calculateSkillBonuses({
      modifiers,
      proficiencyBonus,
      skillStates: [],
    })

    // Пока savingThrowStates не подключены к БД.
    // Поэтому все proficiencies будут false.
    // Позже сюда можно будет передать CharacterSavingThrowState[].
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
    })

    const hitDice = calculateHitDice(characterForHpCalculation)

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

      attacks,

      magic: {
        spells,
        spellSlots: this.normalizeSpellSlots(character.spellSlots),
        spellcastingAbility: this.normalizeAbilityName(
          character.spellcastingAbility,
        ),
      },

      inventory: {
        items,
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
  // Здесь выбираем правильный repository-метод.
  //
  // findByIdForSheet — предпочтительный метод.
  // Он должен подтягивать hpIncreases.
  //
  // findById — fallback для совместимости.
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
  // Получаем базовые характеристики.
  //
  // Если stats ещё нет в БД, возвращаем безопасные 10.
  // Это временная защита от падения sheet.
  //
  // В целевой модели CharacterStats должны создаваться
  // вместе с персонажем, и этот fallback станет не нужен.
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
  // Эти функции не считают игровые правила.
  // Они только приводят данные к понятному API-ответу.
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

  // =======================================================
  // Inventory helpers
  // =======================================================
  // Сейчас предметы только разделяются на все / экипированные.
  // Позже сюда НЕ надо добавлять сложную игровую логику.
  //
  // Правила слотов, allowedSlots и item effects лучше вынести
  // в отдельные inventory.rules.ts / item-effects calculation.
  // =======================================================

  private getEquippedItems(
    items: CharacterItemEntity[],
  ): CharacterItemEntity[] {
    return items.filter((item) => item.isEquipped)
  }

  // =======================================================
  // Calculation: final stats
  // =======================================================
  // Сейчас итоговые характеристики равны базовым.
  //
  // Позже здесь будет точка подключения:
  // - бонусов предметов
  // - временных эффектов
  // - расовых/классовых эффектов
  //
  // Пока equippedItems передаются параметром специально:
  // чтобы было видно, где будет расширение.
  // =======================================================

  private calculateFinalStats(
    baseStats: AbilityScores,
    _equippedItems: CharacterItemEntity[],
  ): AbilityScores {
    return {
      ...baseStats,
    }
  }

  // =======================================================
  // Calculation: derived values
  // =======================================================
  // Производные значения не должны храниться как истина в БД.
  // Они собираются сервером при запросе sheet.
  //
  // Важно:
  // skills и savingThrows считаются НЕ здесь,
  // а в calculation/skills.rules.ts и
  // calculation/saving-throws.rules.ts.
  //
  // Здесь мы только собираем derived DTO:
  // - maxHp
  // - armorClass
  // - initiative
  // - passivePerception
  // - proficiencyBonus
  // - spellAttackBonus
  // - spellSaveDc
  // =======================================================

  private calculateDerived(input: {
    character: CharacterEntity
    modifiers: AbilityModifiers
    maxHp: number
    proficiencyBonus: number
    passivePerception: number
  }): CharacterDerivedDto {
    const {
      character,
      modifiers,
      maxHp,
      proficiencyBonus,
      passivePerception,
    } = input

    const spellcastingAbility = this.normalizeAbilityName(
      character.spellcastingAbility,
    )

    const spellcastingModifier = spellcastingAbility
      ? modifiers[spellcastingAbility]
      : null

    return {
      maxHp,

      // Базовая броня без брони: 10 + DEX modifier.
      // Броня, щиты и предметы будут добавлены позже.
      armorClass: 10 + modifiers.dexterity,

      // Инициатива пока равна DEX modifier.
      initiative: modifiers.dexterity,

      // Теперь считается через skills.rules.ts:
      // 10 + bonus навыка Внимательность/Восприятие.
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
  // D&D 5e:
  // level 1-4   => +2
  // level 5-8   => +3
  // level 9-12  => +4
  // level 13-16 => +5
  // level 17-20 => +6
  //
  // Формула:
  // ceil(level / 4) + 1
  //
  // level дополнительно ограничиваем 1..20,
  // чтобы расчёт не ломался от некорректных данных.
  // =======================================================

  private calculateProficiencyBonus(level: number): number {
    const safeLevel = Math.min(Math.max(level, 1), 20)

    return Math.ceil(safeLevel / 4) + 1
  }

  // =======================================================
  // Spell helpers
  // =======================================================
  // Эти функции приводят spellcastingAbility и spellSlots
  // к безопасному виду для API-ответа.
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