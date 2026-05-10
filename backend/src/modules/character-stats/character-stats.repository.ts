import { prisma } from '../../lib/prisma'
import type {
  CreateCharacterStatsInput,
  UpdateCharacterStatsInput,
} from './character-stats.schemas'

type ClampHpStateInput = {
  currentHp: number
  temporaryHp: number
}

export const characterStatsRepository = {
  // Найти статы персонажа
  findStatsByCharacterId(characterId: string) {
    return prisma.characterStats.findUnique({
      where: {
        characterId,
      },
    })
  },

  // Создать статы персонажа
  createStats(characterId: string, data: CreateCharacterStatsInput) {
    return prisma.characterStats.create({
      data: {
        characterId,
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
      },
    })
  },

  // Обновить статы персонажа
  updateStats(characterId: string, data: UpdateCharacterStatsInput) {
    return prisma.characterStats.update({
      where: {
        characterId,
      },
      data: {
        ...(data.strength !== undefined && { strength: data.strength }),
        ...(data.dexterity !== undefined && { dexterity: data.dexterity }),
        ...(data.constitution !== undefined && {
          constitution: data.constitution,
        }),
        ...(data.intelligence !== undefined && {
          intelligence: data.intelligence,
        }),
        ...(data.wisdom !== undefined && { wisdom: data.wisdom }),
        ...(data.charisma !== undefined && { charisma: data.charisma }),
      },
    })
  },
  
  upsertStatsAndClampHp(
    characterId: string,
    data: CreateCharacterStatsInput,
    hpState?: ClampHpStateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedStats = await tx.characterStats.upsert({
        where: {
          characterId,
        },
        create: {
          characterId,
          strength: data.strength,
          dexterity: data.dexterity,
          constitution: data.constitution,
          intelligence: data.intelligence,
          wisdom: data.wisdom,
          charisma: data.charisma,
        },
        update: {
          strength: data.strength,
          dexterity: data.dexterity,
          constitution: data.constitution,
          intelligence: data.intelligence,
          wisdom: data.wisdom,
          charisma: data.charisma,
        },
      })

      if (hpState) {
        await tx.character.update({
          where: {
            id: characterId,
          },
          data: {
            currentHp: hpState.currentHp,
            temporaryHp: hpState.temporaryHp,
          },
        })
      }

      return updatedStats
    })
  },
}