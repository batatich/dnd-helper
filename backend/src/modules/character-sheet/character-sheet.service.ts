import { CharacterNotFoundError } from '../characters/errors'
import { calculateHitDice, calculateMaxHp } from '../calculation/hp.rules'

// =========================================================
// Тип основной сущности персонажа
// =========================================================
// Это не Prisma-модель напрямую, а минимальная форма данных,
// с которой работает CharacterSheetService.
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

  // Использование костей хитов.
  // total и dice могут считаться сервером,
  // а used — это состояние, которое хранится у персонажа.
  hitDiceUsed?: number | null

  createdAt: Date
  updatedAt: Date

  // История прироста HP по уровням.
  // Нужна для расчёта maxHp.
  hpIncreases?: CharacterHpIncreaseEntity[]
}

// =========================================================
// История прироста HP
// =========================================================
// Каждая запись означает, сколько HP персонаж получил
// при повышении конкретного уровня.
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
// Базовые характеристики персонажа
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

// =========================================================
// Атака персонажа
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
// Заклинание персонажа
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
// Предмет персонажа
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
// Repository-интерфейсы
// =========================================================
// Service не должен знать Prisma напрямую.
// Он работает только через repository.
type CharacterRepository = {
  findById: (id: string) => Promise<CharacterEntity | null>
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
// Модификаторы характеристик
// =========================================================
type AbilityModifiers = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

// =========================================================
// Производные значения листа
// =========================================================
// Это то, что не должно храниться как истина в БД,
// а должно считаться сервером.
type DerivedStats = {
  modifiers: AbilityModifiers
  initiative: number
  passivePerception: number
  maxHp: number
}

// =========================================================
// CharacterSheetService
// =========================================================
// Собирает готовый character sheet:
// персонаж + статы + атаки + заклинания + предметы + derived.
export class CharacterSheetService {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterStatsRepository: CharacterStatsRepository,
    private readonly attackRepository: CharacterAttackRepository,
    private readonly spellRepository: CharacterSpellRepository,
    private readonly itemRepository: CharacterItemRepository,
  ) {}

  // =========================================================
  // Получить полный лист персонажа
  // =========================================================
  async getCharacterSheet(characterId: string) {
    // 1. Получаем базового персонажа.
    // Важно: repository должен подтягивать hpIncreases,
    // иначе maxHp будет считаться только как HP первого уровня.
    const character = await this.characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    // 2. Получаем базовые характеристики.
    // Если stats ещё не созданы, getStats вернёт безопасные значения 10.
    const stats = await this.getStats(characterId)

    // 3. Получаем связанные данные листа.
    const attacks = await this.attackRepository.findByCharacterId(characterId)
    const spells = await this.spellRepository.findByCharacterId(characterId)
    const items = await this.itemRepository.findByCharacterId(characterId)

    // 4. Отдельно выделяем надетые предметы.
    // Сейчас это только отображение.
    // Эффекты предметов позже должны считаться на сервере.
    const equippedItems = items.filter(
      (item: CharacterItemEntity) => item.isEquipped,
    )

    // 5. Собираем объект для расчётов.
    // hp.rules.ts ожидает character.stats и character.hpIncreases.
    const characterForCalculation = {
      ...character,
      stats,
      hpIncreases: character.hpIncreases ?? [],
    }

    // 6. Считаем производные значения.
    // maxHp теперь считается через HP rules:
    // 1 уровень = 8 + CON modifier,
    // дальше = сумма hpIncreases.
    const derived = this.calculateDerived(stats, characterForCalculation)

    // 7. Считаем кости хитов.
    // Сейчас: total = level, dice = 1d8, used = hitDiceUsed.
    const hitDice = calculateHitDice(characterForCalculation)

    // 8. Возвращаем готовый sheet.
    // Фронт должен это отображать, а не пересчитывать сам.
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

      // HP-состояние
      currentHp: character.currentHp,
      temporaryHp: character.temporaryHp,

      // Общие поля
      speed: character.speed,
      inspiration: character.inspiration,

      // Системные поля
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,

      // Основные блоки листа
      stats,
      attacks,
      spells,
      items,
      equippedItems,

      // Производные значения
      derived,

      // Кости хитов
      hitDice,

      // История прироста HP по уровням.
      // Полезно для дебага и будущего UI.
      hpIncreases: character.hpIncreases ?? [],
    }
  }

  // =========================================================
  // Получить характеристики персонажа
  // =========================================================
  private async getStats(characterId: string): Promise<CharacterStatsEntity> {
    const stats = await this.characterStatsRepository.findByCharacterId(
      characterId,
    )

    // Если stats ещё нет в БД, возвращаем безопасный дефолт.
    // Это не игровая истина, а защита от падения sheet.
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

  // =========================================================
  // Расчёт производных значений
  // =========================================================
  private calculateDerived(
    stats: CharacterStatsEntity,
    character: CharacterEntity & {
      stats: CharacterStatsEntity
      hpIncreases: CharacterHpIncreaseEntity[]
    },
  ): DerivedStats {
    // Считаем модификаторы характеристик.
    const modifiers: AbilityModifiers = {
      strength: this.getModifier(stats.strength),
      dexterity: this.getModifier(stats.dexterity),
      constitution: this.getModifier(stats.constitution),
      intelligence: this.getModifier(stats.intelligence),
      wisdom: this.getModifier(stats.wisdom),
      charisma: this.getModifier(stats.charisma),
    }

    return {
      modifiers,

      // Инициатива пока равна DEX modifier.
      initiative: modifiers.dexterity,

      // Пассивная внимательность пока = 10 + WIS modifier.
      passivePerception: 10 + modifiers.wisdom,

      // Новый серверный maxHp.
      maxHp: calculateMaxHp(character),
    }
  }

  // =========================================================
  // D&D modifier
  // =========================================================
  // Например:
  // 10 => 0
  // 12 => +1
  // 8  => -1
  private getModifier(stat: number): number {
    return Math.floor((stat - 10) / 2)
  }
}