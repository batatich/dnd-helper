import { prisma } from '../../lib/prisma'
import { Prisma } from '@prisma/client'
import { ValidationError } from '../../shared/errors'

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

type LevelUpHpStateInput = {
  level: number
  currentHp: number
  temporaryHp: number
  hitDiceTotal: number
  hitDiceDice: string
}

type CharacterHpDbClient = {
  character: typeof prisma.character
}

// =========================================================
// Select configs
// =========================================================

const characterHpStateSelect = {
  id: true,
  level: true,

  currentHp: true,
  temporaryHp: true,

  hitDiceTotal: true,
  hitDiceUsed: true,
  hitDiceDice: true,

  inspiration: true,

  deathSaveSuccesses: true,
  deathSaveFailures: true,

  spellSlots: true,

  createdAt: true,
  updatedAt: true,
} as const

export const characterHpRepository = {
  withLockedCharacter<T>(
    id: string,
    action: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id
        FROM "Character"
        WHERE id = ${id}
        FOR UPDATE
      `

      return action(tx)
    })
  },

  // Обновить HP-состояние персонажа.
  // Используется для damage / heal / set temp HP.
  updateHpState(
    id: string,
    data: UpdateHpStateInput,
    db: CharacterHpDbClient = prisma,
  ) {
    return db.character.update({
      where: { id },
      data: {
        currentHp: data.currentHp,
        temporaryHp: data.temporaryHp,
      },
      select: characterHpStateSelect,
    })
  },

  // Получить персонажа со всем, что нужно для расчёта HP.
  // Используется для heal / level-up / пересчёта maxHp.
  findByIdWithHpData(id: string, db: CharacterHpDbClient = prisma) {
    return db.character.findUnique({
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

  async levelUpWithHpIncrease(
    id: string,
    hpIncrease: CreateHpIncreaseInput,
    hpState: LevelUpHpStateInput,
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
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
          select: characterHpStateSelect,
        })
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ValidationError(
          `HP increase for level ${hpIncrease.level} already exists`,
        )
      }

      throw error
    }
  },

  // =========================================================
  // Hit dice
  // =========================================================

  findHitDiceByCharacterId(id: string, db: CharacterHpDbClient = prisma) {
    return db.character.findUnique({
      where: { id },
      select: {
        id: true,
        level: true,
        hitDiceUsed: true,
        hitDiceDice: true,
      },
    })
  },

  updateHitDiceUsed(
    id: string,
    used: number,
    db: CharacterHpDbClient = prisma,
  ) {
    return db.character.update({
      where: { id },
      data: {
        hitDiceUsed: used,
      },
      select: characterHpStateSelect,
    })
  },

  // =========================================================
  // Inspiration
  // =========================================================

  updateInspiration(id: string, inspiration: boolean) {
    return prisma.character.update({
      where: { id },
      data: {
        inspiration,
      },
      select: characterHpStateSelect,
    })
  },

  // =========================================================
  // Death saves
  // =========================================================

  findDeathSavesByCharacterId(id: string, db: CharacterHpDbClient = prisma) {
    return db.character.findUnique({
      where: { id },
      select: {
        id: true,
        deathSaveSuccesses: true,
        deathSaveFailures: true,
      },
    })
  },

  updateDeathSaves(
    id: string,
    data: {
      successes: number
      failures: number
    },
    db: CharacterHpDbClient = prisma,
  ) {
    return db.character.update({
      where: { id },
      data: {
        deathSaveSuccesses: data.successes,
        deathSaveFailures: data.failures,
      },
      select: characterHpStateSelect,
    })
  },
}
