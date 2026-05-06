import { ValidationError } from '../../shared/errors'
import { characterSpellsRepository } from './character-spells.repository'
import { characterRepository } from '../characters/character.repository'
import {
  CharacterNotFoundError,
  SpellNotFoundError,
  SpellOwnershipError,
} from '../characters/errors'
import type {
  CreateSpellInput,
  SpellSlotItemInput,
  UpdateSpellInput,
} from './character-spells.schemas'

export const characterSpellsService = {
  // =========================================================
  // Spells
  // =========================================================

  // Добавить заклинание персонажу
  async addSpell(characterId: string, data: CreateSpellInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return characterSpellsRepository.addSpell(characterId, data)
  },

  // Обновить заклинание персонажа
  async updateSpell(
    characterId: string,
    spellId: string,
    data: UpdateSpellInput,
  ) {
    const spell = await characterSpellsRepository.findSpellById(spellId)

    if (!spell) {
      throw new SpellNotFoundError(spellId)
    }

    if (spell.characterId !== characterId) {
      throw new SpellOwnershipError(characterId, spellId)
    }

    return characterSpellsRepository.updateSpell(spellId, data)
  },

  // Удалить заклинание персонажа
  async deleteSpell(characterId: string, spellId: string) {
    const spell = await characterSpellsRepository.findSpellById(spellId)

    if (!spell) {
      throw new SpellNotFoundError(spellId)
    }

    if (spell.characterId !== characterId) {
      throw new SpellOwnershipError(characterId, spellId)
    }

    await characterSpellsRepository.deleteSpell(spellId)
  },

  // =========================================================
  // Spell slots
  // =========================================================

  // Обновить spell slots персонажа
  async updateSpellSlots(
    characterId: string,
    spellSlots: SpellSlotItemInput[],
  ) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    for (const slot of spellSlots) {
      if (slot.used > slot.total) {
        throw new ValidationError(
          `Used spell slots cannot exceed total for level ${slot.level}`,
        )
      }
    }

    return characterSpellsRepository.updateSpellSlots(characterId, {
      spellSlots,
    })
  },
}