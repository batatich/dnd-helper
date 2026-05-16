import { characterAttacksRepository } from './character-attacks.repository'
import { characterRepository } from '../characters/character.repository'
import type {
  CreateAttackInput,
  UpdateAttackInput,
} from './character-attacks.schemas'
import {
  AttackNotFoundError,
  AttackOwnershipError,
  CharacterNotFoundError,
} from '../characters/errors'

export const characterAttacksService = {
  // Создать атаку персонажа
  async addAttack(characterId: string, data: CreateAttackInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return characterAttacksRepository.addAttack(characterId, data)
  },

  // Обновить атаку персонажа
  async updateAttack(
    characterId: string,
    attackId: string,
    data: UpdateAttackInput,
  ) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const attack = await characterAttacksRepository.findAttackById(attackId)

    if (!attack) {
      throw new AttackNotFoundError(attackId)
    }

    if (attack.characterId !== characterId) {
      throw new AttackOwnershipError(characterId, attackId)
    }

    return characterAttacksRepository.updateAttack(attackId, data)
  },

  // Удалить атаку персонажа
  async deleteAttack(characterId: string, attackId: string) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const attack = await characterAttacksRepository.findAttackById(attackId)

    if (!attack) {
      throw new AttackNotFoundError(attackId)
    }

    if (attack.characterId !== characterId) {
      throw new AttackOwnershipError(characterId, attackId)
    }

    return characterAttacksRepository.deleteAttack(attackId)
  },
}