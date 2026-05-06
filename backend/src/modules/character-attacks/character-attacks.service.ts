import { characterAttacksRepository } from './character-attacks.repository'
import { characterRepository } from '../characters/character.repository'
import { CharacterNotFoundError } from '../characters/errors'
import type {
  CreateAttackInput,
  UpdateAttackInput,
} from './character-attacks.schemas'

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

    return characterAttacksRepository.updateAttack(attackId, data)
  },

  // Удалить атаку персонажа
  async deleteAttack(characterId: string, attackId: string) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return characterAttacksRepository.deleteAttack(attackId)
  },
}