import { prisma } from '../../lib/prisma'
import type {
  CreateSpellInput,
  UpdateSpellInput,
  UpdateSpellSlotsInput,
} from './character-spells.schemas'

// =========================================================
// Include-конфиги
// =========================================================

// Нужен только для updateSpellSlots, чтобы вернуть персонажа
// с тем же набором связей, что раньше возвращал character.repository.
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

  // Обновить весь массив spell slots у персонажа.
  // В Prisma поле хранится как Json.
  updateSpellSlots(id: string, data: UpdateSpellSlotsInput) {
    return prisma.character.update({
      where: { id },
      data: {
        spellSlots: data.spellSlots,
      },
      include: characterSheetInclude,
    })
  },
}