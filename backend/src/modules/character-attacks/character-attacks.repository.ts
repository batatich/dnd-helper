import { prisma } from '../../lib/prisma'
import type {
  CreateAttackInput,
  UpdateAttackInput,
} from './character-attacks.schemas'

export const characterAttacksRepository = {
  // Найти атаку по ID.
  findAttackById(attackId: string) {
    return prisma.characterAttack.findUnique({
      where: { id: attackId },
    })
  },

  // Получить все атаки персонажа.
  findAttacksByCharacterId(characterId: string) {
    return prisma.characterAttack.findMany({
      where: { characterId },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  // Добавить атаку персонажу.
  addAttack(characterId: string, data: CreateAttackInput) {
    return prisma.characterAttack.create({
      data: {
        characterId,
        name: data.name,
        attackType: data.attackType ?? null,
        ability: data.ability ?? null,
        proficient: data.proficient ?? false,
        damageDice: data.damageDice ?? null,
        damageBonus: data.damageBonus ?? null,
        damageType: data.damageType ?? null,
        notes: data.notes ?? null,

        source: 'manual',
        itemId: null,
      },
    })
  },

  // Обновить атаку.
  updateAttack(attackId: string, data: UpdateAttackInput) {
    return prisma.characterAttack.update({
      where: { id: attackId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.attackType !== undefined && { attackType: data.attackType }),
        ...(data.ability !== undefined && { ability: data.ability }),
        ...(data.proficient !== undefined && { proficient: data.proficient }),
        ...(data.damageDice !== undefined && { damageDice: data.damageDice }),
        ...(data.damageBonus !== undefined && {
          damageBonus: data.damageBonus,
        }),
        ...(data.damageType !== undefined && { damageType: data.damageType }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })
  },

  // Удалить атаку.
  deleteAttack(attackId: string) {
    return prisma.characterAttack.delete({
      where: { id: attackId },
    })
  },
}