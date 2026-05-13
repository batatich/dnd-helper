import { prisma } from '../../lib/prisma'
import type {
  CreateCharacterStatsInput,
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