import { prisma } from '../../lib/prisma'

// =========================================================
// Types
// =========================================================

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

// =========================================================
// Include-конфиги
// =========================================================

const characterBaseInclude = {
  stats: true,
} as const

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

export const characterHpRepository = {
  // Обновить HP-состояние персонажа.
  // Используется для damage / heal / set temp HP.
  updateHpState(id: string, data: UpdateHpStateInput) {
    return prisma.character.update({
      where: { id },
      data: {
        currentHp: data.currentHp,
        temporaryHp: data.temporaryHp,
      },
      include: characterBaseInclude,
    })
  },

  // Получить персонажа со всем, что нужно для расчёта HP.
  // Используется для heal / level-up / пересчёта maxHp.
  findByIdWithHpData(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: {
        stats: true,
        hpIncreases: {
          orderBy: {
            level: 'asc',
          },
        },
      },
    })
  },

  // Найти HP-прибавку конкретного персонажа на конкретном уровне.
  findHpIncreaseByLevel(characterId: string, level: number) {
    return prisma.characterHpIncrease.findFirst({
      where: {
        characterId,
        level,
      },
    })
  },

  // Сохранить HP-прибавку за уровень.
  createHpIncrease(characterId: string, data: CreateHpIncreaseInput) {
    return prisma.characterHpIncrease.create({
      data: {
        characterId,
        level: data.level,
        mode: data.mode,
        value: data.value,
        dice: data.dice,
        rolledValue: data.rolledValue ?? null,
      },
    })
  },

  // Обновить уровень и HP-состояние после level-up.
  updateLevelAndHpState(id: string, data: UpdateLevelAndHpStateInput) {
    return prisma.character.update({
      where: { id },
      data: {
        level: data.level,
        currentHp: data.currentHp,
        temporaryHp: data.temporaryHp,
        hitDiceTotal: data.hitDiceTotal,
        hitDiceDice: data.hitDiceDice,
      },
      include: characterSheetInclude,
    })
  },

  // Удаляет HP-прибавки выше указанного уровня.
  // Нужно, когда пользователь вручную понижает level через форму.
  deleteHpIncreasesAboveLevel(characterId: string, level: number) {
    return prisma.characterHpIncrease.deleteMany({
      where: {
        characterId,
        level: {
          gt: level,
        },
      },
    })
  },
}