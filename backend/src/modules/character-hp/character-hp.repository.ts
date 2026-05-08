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

  // Сохранить HP-прибавку за уровень. Возможно стоит удалить как устаревший метод?
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

  // Обновить уровень и HP-состояние после level-up. Возможно стоит удалить как устаревший метод?
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

  levelUpWithHpIncrease(
    id: string,
    hpIncrease: CreateHpIncreaseInput,
    hpState: UpdateLevelAndHpStateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.characterHpIncrease.create({
        data: {
          characterId: id,
          level: hpIncrease.level,
          mode: hpIncrease.mode,
          value: hpIncrease.value,
          dice: hpIncrease.dice,
          rolledValue: hpIncrease.rolledValue ?? null,
        },
      })

      return tx.character.update({
        where: { id },
        data: {
          level: hpState.level,
          currentHp: hpState.currentHp,
          temporaryHp: hpState.temporaryHp,
          hitDiceTotal: hpState.hitDiceTotal,
          hitDiceDice: hpState.hitDiceDice,
        },
        include: characterSheetInclude,
      })
    })
  },

  // =========================================================
  // Hit dice
  // =========================================================
  // Получить данные персонажа, нужные для use/restore hit dice.
  // total считается через level, used хранится в Character.hitDiceUsed.
  // =========================================================

  findHitDiceByCharacterId(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        level: true,
        hitDiceUsed: true,
        hitDiceDice: true,
      },
    })
  },

  // =========================================================
  // Обновить количество использованных hit dice.
  // =========================================================

  updateHitDiceUsed(id: string, used: number) {
    return prisma.character.update({
      where: { id },
      data: {
        hitDiceUsed: used,
      },
    })
  },

  // =========================================================
  // Inspiration
  // =========================================================
  // Обновить состояние вдохновения персонажа.
  // =========================================================

  updateInspiration(id: string, inspiration: boolean) {
  return prisma.character.update({
      where: { id },
      data: {
      inspiration,
      },
  })
  },

// =========================================================
  // Death saves
  // =========================================================
  // Получить только поля death saves.
  // =========================================================

  findDeathSavesByCharacterId(id: string) {
  return prisma.character.findUnique({
      where: { id },
      select: {
      id: true,
      deathSaveSuccesses: true,
      deathSaveFailures: true,
      },
  })
  },

  // =========================================================
  // Обновить death saves.
  // =========================================================

  updateDeathSaves(
  id: string,
  data: {
      successes: number
      failures: number
  },
  ) {
  return prisma.character.update({
      where: { id },
      data: {
      deathSaveSuccesses: data.successes,
      deathSaveFailures: data.failures,
      },
  })
  },
}