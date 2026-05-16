import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.schemas'
import { characterRepository } from './character.repository'
import { CharacterNotFoundError } from './errors'
import { toCharacterProfileDto } from './character.mappers'

export const characterService = {
  // =========================================================
  // Characters
  // =========================================================

  async getCharacters() {
    const characters = await characterRepository.findAll()

    return characters.map(toCharacterProfileDto)
  },

  async getCharacterById(id: string) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return toCharacterProfileDto(character)
  },

  async createCharacter(data: CreateCharacterInput) {
    // Если форма передала baseStats, стартовые HP считаются от их CON.
    // Без baseStats остаётся дефолтный CON 10.
    const constitution = data.baseStats?.constitution ?? 10
    const conModifier = Math.floor((constitution - 10) / 2)
    const maxHp = 8 + conModifier

    // Новый персонаж создаётся полностью здоровым:
    // currentHp = maxHp.
    //
    // Также сразу задаём hit dice:
    // 1 уровень = 1 кость хитов 1d8.
    const character = await characterRepository.create({
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

    return toCharacterProfileDto(character)
  },

  async updateCharacter(id: string, data: UpdateCharacterInput) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const updatedCharacter = await characterRepository.update(id, data)

    return toCharacterProfileDto(updatedCharacter)
  },

  async deleteCharacter(id: string) {
    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    await characterRepository.delete(id)
  },
}
