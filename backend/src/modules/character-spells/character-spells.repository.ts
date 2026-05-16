import { prisma } from '../../lib/prisma'
import { Prisma } from '@prisma/client'
import type {
  CreateSpellInput,
  UpdateSpellInput,
} from './character-spells.schemas'


export const characterSpellsRepository = {
  // =========================================================
  // Spells
  // =========================================================

  // Найти заклинание по ID.
  findSpellById(spellId: string) {
    return prisma.characterSpell.findUnique({
      where: { id: spellId },
    })
  },

  // Получить все заклинания персонажа.
  findSpellsByCharacterId(characterId: string) {
    return prisma.characterSpell.findMany({
      where: { characterId },
      orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
    })
  },

  // Добавить заклинание персонажу.
  addSpell(characterId: string, data: CreateSpellInput) {
    return prisma.characterSpell.create({
      data: {
        characterId,
        name: data.name,
        level: data.level,
        school: data.school ?? null,
        castingTime: data.castingTime ?? null,
        range: data.range ?? null,
        components: data.components ?? null,
        duration: data.duration ?? null,
        concentration: data.concentration ?? false,
        ritual: data.ritual ?? false,
        description: data.description ?? null,
      },
    })
  },

  // Обновить заклинание.
  updateSpell(spellId: string, data: UpdateSpellInput) {
    return prisma.characterSpell.update({
      where: { id: spellId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.school !== undefined && { school: data.school }),
        ...(data.castingTime !== undefined && {
          castingTime: data.castingTime,
        }),
        ...(data.range !== undefined && { range: data.range }),
        ...(data.components !== undefined && { components: data.components }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.concentration !== undefined && {
          concentration: data.concentration,
        }),
        ...(data.ritual !== undefined && { ritual: data.ritual }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    })
  },

  // Удалить заклинание.
  deleteSpell(spellId: string) {
    return prisma.characterSpell.delete({
      where: { id: spellId },
    })
  },

  // =========================================================
  // Spell slots
  // =========================================================
  // Получить spell slots персонажа.
  // spellSlots, скорее всего, хранится как Json-поле в Character.
  // =========================================================

  findCharacterSpellSlots(characterId: string) {
    return prisma.character.findUnique({
      where: {
        id: characterId,
      },
      select: {
        id: true,
        spellSlots: true,
      },
    })
  },

  // =========================================================
  // Обновить spell slots персонажа.
  // Сюда уже должен приходить массив, обработанный rules-слоем.
  // =========================================================

  updateCharacterSpellSlots(characterId: string, spellSlots: unknown[]) {
    return prisma.character.update({
      where: {
        id: characterId,
      },
      data: {
        spellSlots: spellSlots as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        spellSlots: true,
      },
    })
  },
}