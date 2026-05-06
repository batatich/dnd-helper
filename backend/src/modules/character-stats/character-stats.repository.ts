import { prisma } from '../../lib/prisma'
import type {
  CreateCharacterStatsInput,
  UpdateCharacterStatsInput,
} from './character-stats.schemas'

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

  // Создать или обновить статы персонажа
  upsertStats(characterId: string, data: CreateCharacterStatsInput) {
    return prisma.characterStats.upsert({
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
  },
}