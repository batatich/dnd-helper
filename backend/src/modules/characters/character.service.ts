import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.schemas'
import { ValidationError } from '../../shared/errors'
import { characterRepository } from './character.repository'
import {
  CharacterNotFoundError,
} from './errors'

import { calculateMaxHp } from '../calculation/hp.rules'

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

  // 🔥 НОВОЕ — получить полный sheet
  async getCharacterSheet(id: string) {
    const character = await characterRepository.findByIdWithSheet(id)

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
      hitDiceTotal: 1,
      hitDiceUsed: 0,
      hitDiceDice: '1d8',
    })
  },

    async updateCharacter(id: string, data: UpdateCharacterInput) {
    const character = await characterRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    // Если level не меняется — обычное обновление.
    if (data.level === undefined || data.level === character.level) {
      return characterRepository.update(id, data)
    }

    // Уровень должен быть только от 1 до 20.
    if (data.level < 1 || data.level > 20) {
      throw new ValidationError('Character level must be between 1 and 20')
    }

    // Через форму запрещаем повышать уровень.
    // Для повышения нужен выбор fixed / roll.
    if (data.level > character.level) {
      throw new ValidationError(
        'Use level-up action to increase character level',
      )
    }

    // Если уровень понижается — удаляем будущие HP-прибавки.
    await characterRepository.deleteHpIncreasesAboveLevel(id, data.level)

    // Оставляем только HP-прибавки, которые подходят под новый уровень.
    const remainingHpIncreases = character.hpIncreases.filter(
      (increase) => increase.level <= data.level!,
    )

    // Считаем новый maxHp после понижения.
    const maxHp = calculateMaxHp({
      ...character,
      ...data,
      level: data.level,
      hpIncreases: remainingHpIncreases,
    })

    // После понижения currentHp не может быть выше нового maxHp.
    return characterRepository.update(id, {
      ...data,
      level: data.level,
      currentHp: Math.min(data.currentHp ?? character.currentHp, maxHp),
      hitDiceTotal: data.level,
      hitDiceDice: '1d8',
    })
  },

    async deleteCharacter(id: string) {
      const existingCharacter = await characterRepository.findById(id)

      if (!existingCharacter) {
        throw new CharacterNotFoundError(id)
      }

      await characterRepository.delete(id)
    }
}