import { prisma } from '../../lib/prisma'
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.schemas'

// =========================================================
// Select / include-конфиги
// =========================================================

// Базовый профиль персонажа.
// Используется для:
// GET /characters
// GET /characters/:id
// POST /characters
// PATCH /characters/:id
//
// Важно:
// здесь подтягиваем только base stats для карточек/форм.
// Полный лист должен идти через GET /characters/:id/sheet.
const characterProfileSelect = {
  id: true,

  name: true,
  race: true,
  className: true,
  level: true,

  description: true,
  alignment: true,
  background: true,
  avatarUrl: true,

  currentHp: true,
  temporaryHp: true,
  speed: true,
  inspiration: true,
  spellcastingAbility: true,

  stats: {
    select: {
      strength: true,
      dexterity: true,
      constitution: true,
      intelligence: true,
      wisdom: true,
      charisma: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} as const

// Расширенный include для сборки CharacterSheet.
// Используется только там, где нужен полный sheet.
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

  // Получить список базовых профилей персонажей.
  findAll() {
    return prisma.character.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: characterProfileSelect,
    })
  },

  // Получить базовый профиль персонажа по ID.
  findById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: characterProfileSelect,
    })
  },

  // Получить персонажа с полным набором связанных сущностей.
  // Это НЕ готовый sheet. Это только данные для CharacterSheetService.
  findByIdForSheet(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterSheetInclude,
    })
  },

  // Создать нового персонажа.
  //
  // Важно:
  // - поля spellcastingAbility / death saves / hit dice / spellSlots
  //   записываются в Character, а не в CharacterStats;
  // - stats создаются отдельно как relation create;
  // - наружу возвращаем только базовый профиль.
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
            strength: data.baseStats?.strength ?? 10,
            dexterity: data.baseStats?.dexterity ?? 10,
            constitution: data.baseStats?.constitution ?? 10,
            intelligence: data.baseStats?.intelligence ?? 10,
            wisdom: data.baseStats?.wisdom ?? 10,
            charisma: data.baseStats?.charisma ?? 10,
          },
        },
      },
      select: characterProfileSelect,
    })
  },

  // Обновить только базовые поля персонажа.
  //
  // HP / death saves / hit dice / inspiration / stats / attacks / spells /
  // inventory здесь не меняются. Для них есть отдельные modules/actions.
  update(id: string, data: UpdateCharacterInput) {
    return prisma.character.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.race !== undefined && { race: data.race }),
        ...(data.className !== undefined && { className: data.className }),

        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.alignment !== undefined && {
          alignment: data.alignment,
        }),
        ...(data.background !== undefined && {
          background: data.background,
        }),

        ...(data.avatarUrl !== undefined && {
          avatarUrl:
            typeof data.avatarUrl === 'string' && data.avatarUrl.trim()
              ? data.avatarUrl
              : null,
        }),

        ...(data.speed !== undefined && { speed: data.speed }),

        ...(data.spellcastingAbility !== undefined && {
          spellcastingAbility: data.spellcastingAbility,
        }),
      },
      select: characterProfileSelect,
    })
  },

  // Удалить персонажа.
  delete(id: string) {
    return prisma.character.delete({
      where: { id },
    })
  },
}
