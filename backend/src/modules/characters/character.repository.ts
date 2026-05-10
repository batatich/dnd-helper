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

type CreateCharacterRepositoryInput = CreateCharacterInput & {
  currentHp: number
  temporaryHp: number
  inspiration: boolean

  deathSaveSuccesses: number
  deathSaveFailures: number

  hitDiceTotal: number
  hitDiceUsed: number
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
  findByIdForSheet(id: string) {
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
  create(data: CreateCharacterRepositoryInput) {
    return prisma.character.create({
      data: {
        name: data.name,
        race: data.race,
        className: data.className,
        level: data.level ?? 1,
        description: data.description ?? null,
        alignment: data.alignment ?? null,
        background: data.background ?? null,

        avatarUrl:
          typeof data.avatarUrl === 'string' && data.avatarUrl.trim()
            ? data.avatarUrl
            : null,

        currentHp: data.currentHp,
        temporaryHp: data.temporaryHp,
        speed: data.speed ?? 30,
        inspiration: data.inspiration,

        spellcastingAbility: data.spellcastingAbility ?? null,

        deathSaveSuccesses: data.deathSaveSuccesses,
        deathSaveFailures: data.deathSaveFailures,

        hitDiceTotal: data.hitDiceTotal,
        hitDiceUsed: data.hitDiceUsed,
        hitDiceDice: data.hitDiceDice,

        spellSlots: [],

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
        ...(data.className !== undefined && { className: data.className }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.alignment !== undefined && { alignment: data.alignment }),
        ...(data.background !== undefined && { background: data.background }),

        ...(data.avatarUrl !== undefined && {
          avatarUrl:
            typeof data.avatarUrl === 'string' && data.avatarUrl.trim()
              ? data.avatarUrl
              : null,
        }),
        ...(data.speed !== undefined && { speed: data.speed }),

        ...(data.spellcastingAbility !== undefined && { spellcastingAbility: data.spellcastingAbility}),
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