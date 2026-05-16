import { characterSpellsRepository } from './character-spells.repository'
import { characterRepository } from '../characters/character.repository'
import {
  CharacterNotFoundError,
  SpellNotFoundError,
  SpellOwnershipError,
} from '../characters/errors'
import type {
  CreateSpellInput,
  UpdateSpellInput,
} from './character-spells.schemas'
import {
  normalizeSpellSlots,
  restoreSpellSlot,
  setSpellSlotTotal,
  useSpellSlot,
} from '../calculation/spell-slots.rules'

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
  // Spell slots: set total
  // =========================================================
  // Устанавливает общее количество слотов конкретного уровня.
  // Если used > total, rules-слой сам обрежет used.
  // =========================================================

  async setSpellSlotTotal(
    characterId: string,
    level: number,
    total: number,
  ) {
    const character =
      await characterSpellsRepository.findCharacterSpellSlots(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const currentSlots = normalizeSpellSlots(character.spellSlots)
    const nextSlots = setSpellSlotTotal(currentSlots, level, total)

    return characterSpellsRepository.updateCharacterSpellSlots(
      characterId,
      nextSlots,
    )
  },

  // =========================================================
  // Spell slots: use
  // =========================================================
  // Использует 1 слот конкретного уровня.
  // Если использовать нельзя, rules-слой бросит SpellSlotConflictError.
  // =========================================================

  async useSpellSlot(characterId: string, level: number) {
    const character =
      await characterSpellsRepository.findCharacterSpellSlots(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const currentSlots = normalizeSpellSlots(character.spellSlots)
    const nextSlots = useSpellSlot(currentSlots, level)

    return characterSpellsRepository.updateCharacterSpellSlots(
      characterId,
      nextSlots,
    )
  },

  // =========================================================
  // Spell slots: restore
  // =========================================================
  // Восстанавливает 1 слот конкретного уровня.
  // Если used уже 0, rules-слой бросит SpellSlotConflictError.
  // =========================================================

  async restoreSpellSlot(characterId: string, level: number) {
    const character =
      await characterSpellsRepository.findCharacterSpellSlots(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    const currentSlots = normalizeSpellSlots(character.spellSlots)
    const nextSlots = restoreSpellSlot(currentSlots, level)

    return characterSpellsRepository.updateCharacterSpellSlots(
      characterId,
      nextSlots,
    )
  },
}