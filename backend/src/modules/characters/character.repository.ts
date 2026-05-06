import { prisma } from '../../lib/prisma'
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.schemas'

// =========================================================
// Include-конфиги
// =========================================================

// Базовый include для большинства операций над персонажем.
// Здесь подтягиваем только stats, чтобы не раздувать ответ без необходимости.
const characterBaseInclude = {
  stats: true,
} as const

// Расширенный include для "собранного" персонажа.
// Используется там, где нужен более полный character sheet.
const characterSheetInclude = {
   stats: true,
    attacks: true,
    spells: true,
    items: {
      include: {
        itemTemplate: true,
      },
    },
    hpIncreases: {
      orderBy: {
        level: 'asc',
      },
    },
} as const

// =========================================================
// Внутренние типы repository
// =========================================================

// Внутренний тип для обновления HP-состояния персонажа.
type UpdateHpStateInput = {
  currentHp: number
  temporaryHp: number
}
type HpIncreaseMode = 'fixed' | 'roll'

type CreateHpIncreaseInput = {
  level: number
  mode: HpIncreaseMode
  value: number
  dice: string
  rolledValue?: number | null
}

type UpdateLevelAndHpStateInput = {
  level: number
  currentHp: number
  temporaryHp: number
  hitDiceTotal: number
  hitDiceDice: string
}

export const characterRepository = {
  // =========================================================
  // Characters
  // =========================================================

  // Получить список всех персонажей.
  findAll() {
    return prisma.character.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: characterBaseInclude,
    })
  },

  // Получить персонажа по ID.
  findById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterBaseInclude,
    })
  },

  // Получить персонажа с полным набором связанных сущностей.
  // Это ближе к character sheet, чем обычный findById.
  findByIdWithSheet(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterSheetInclude,
    })
  },

  // Создать нового персонажа.
  // Важно:
  // - поля spellcastingAbility / death saves / hit dice / spellSlots
  //   записываются в Character, а не в CharacterStats
  // - stats создаются отдельно как relation create
  create(data: CreateCharacterInput) {
    return prisma.character.create({
      data: {
        name: data.name,
        race: data.race,
        class: data.class,
        level: data.level ?? 1,
        description: data.description ?? null,
        alignment: data.alignment ?? null,
        background: data.background ?? null,

        // Пустую строку превращаем в null, чтобы не хранить мусор.
        avatarUrl: data.avatarUrl?.trim() ? data.avatarUrl : null,

        currentHp: data.currentHp ?? 0,
        temporaryHp: data.temporaryHp ?? 0,
        speed: data.speed ?? 30,
        inspiration: data.inspiration ?? false,

        spellcastingAbility: data.spellcastingAbility ?? null,

        deathSaveSuccesses: data.deathSaveSuccesses ?? 0,
        deathSaveFailures: data.deathSaveFailures ?? 0,

        hitDiceTotal: data.hitDiceTotal ?? null,
        hitDiceUsed: data.hitDiceUsed ?? 0,
        hitDiceDice: data.hitDiceDice ?? null,

        // В Prisma это Json?, поэтому можно хранить массив объектов напрямую.
        spellSlots: [],

        // Для нового персонажа создаём базовые stats по умолчанию.
        stats: {
          create: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
          },
        },
      },
      include: characterBaseInclude,
    })
  },

  // Обновить базовые поля персонажа.
  update(id: string, data: UpdateCharacterInput) {
    return prisma.character.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.race !== undefined && { race: data.race }),
        ...(data.class !== undefined && { class: data.class }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.alignment !== undefined && { alignment: data.alignment }),
        ...(data.background !== undefined && { background: data.background }),

        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl.trim() ? data.avatarUrl : null,
        }),

        ...(data.currentHp !== undefined && { currentHp: data.currentHp }),
        ...(data.temporaryHp !== undefined && {
          temporaryHp: data.temporaryHp,
        }),
        ...(data.speed !== undefined && { speed: data.speed }),
        ...(data.inspiration !== undefined && { inspiration: data.inspiration }),

        ...(data.spellcastingAbility !== undefined && {
          spellcastingAbility: data.spellcastingAbility,
        }),

        ...(data.deathSaveSuccesses !== undefined && {
          deathSaveSuccesses: data.deathSaveSuccesses,
        }),
        ...(data.deathSaveFailures !== undefined && {
          deathSaveFailures: data.deathSaveFailures,
        }),

        ...(data.hitDiceTotal !== undefined && {
          hitDiceTotal: data.hitDiceTotal,
        }),
        ...(data.hitDiceUsed !== undefined && {
          hitDiceUsed: data.hitDiceUsed,
        }),
        ...(data.hitDiceDice !== undefined && {
          hitDiceDice: data.hitDiceDice,
        }),
      },
      include: characterBaseInclude,
    })
  },

  // Удалить персонажа.
  delete(id: string) {
    return prisma.character.delete({
      where: { id },
    })
  },
}