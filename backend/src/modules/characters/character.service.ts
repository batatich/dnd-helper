import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.schemas'
import { characterRepository } from './character.repository'
import {
  CharacterNotFoundError,
} from './errors'


export const characterService = {
  // =========================================================
  // Characters
  // =========================================================

  async getCharacters() {
    return characterRepository.findAll()
  },

  async getCharacterById(id: string) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return character
  },

  async createCharacter(data: CreateCharacterInput) {
    // Пока при создании персонажа stats создаются в repository по дефолту:
    // constitution = 10.
    // Поэтому HP 1 уровня считаем как 8 + CON modifier.
    // Для CON 10 модификатор = 0, значит стартовое maxHp = 8.
    const constitution = 10
    const conModifier = Math.floor((constitution - 10) / 2)
    const maxHp = 8 + conModifier

    // Новый персонаж должен создаваться полностью здоровым:
    // currentHp = maxHp.
    //
    // Также сразу задаём hit dice:
    // 1 уровень = 1 кость хитов 1d8.
    return characterRepository.create({
      ...data,

      currentHp: maxHp,
      temporaryHp: 0,
      inspiration: false,

      deathSaveSuccesses: 0,
      deathSaveFailures: 0,

      hitDiceTotal: 1,
      hitDiceUsed: 0,
      hitDiceDice: '1d8',
    })
  },

  async updateCharacter(id: string, data: UpdateCharacterInput) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return characterRepository.update(id, data)
  },

  async deleteCharacter(id: string) {
    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    await characterRepository.delete(id)
  }
}