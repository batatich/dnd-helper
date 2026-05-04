import type {
  CreateAttackInput,
  CreateCharacterInput,
  CreateItemInput,
  CreateSpellInput,
  SpellSlotItemInput,
  UpdateAttackInput,
  UpdateCharacterInput,
  UpdateCharacterStatsInput,
  UpdateItemInput,
  UpdateSpellInput,
} from './character.schemas'
import { ValidationError } from '../../shared/errors'
import { characterRepository } from './character.repository'
import {
  AttackNotFoundError,
  AttackOwnershipError,
  CharacterNotFoundError,
  InvalidItemQuantityError,
  ItemAlreadyEquippedError,
  ItemNotEquippedError,
  ItemNotFoundError,
  ItemOwnershipError,
  ItemSlotAlreadyOccupiedError,
  ItemSlotMissingError,
  ItemTemplateNotFoundError,
  SpellNotFoundError,
  SpellOwnershipError,
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

  // 🔥 НОВОЕ — получить полный sheet
  async getCharacterSheet(id: string) {
    const character = await characterRepository.findByIdWithSheet(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return character
  },

  async createCharacter(data: CreateCharacterInput) {
    return characterRepository.create(data)
  },

  async updateCharacter(id: string, data: UpdateCharacterInput) {
    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    return characterRepository.update(id, data)
  },

    // Обновить базовые характеристики персонажа.
  // Stats живут в отдельной таблице CharacterStats,
  // поэтому не обновляются через PATCH /characters/:id.
  async updateCharacterStats(id: string, data: UpdateCharacterStatsInput) {
    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    await characterRepository.updateStats(id, data)

    // Возвращаем полный sheet, чтобы frontend сразу получил актуальные stats.
    return characterRepository.findByIdWithSheet(id)
  },

  async deleteCharacter(id: string) {
    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    await characterRepository.delete(id)
  },

  // =========================================================
  // HP
  // =========================================================

  async damageCharacter(id: string, amount: number) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount < 0) {
      throw new ValidationError('Damage amount cannot be negative')
    }

    let remainingDamage = amount
    let tempHp = character.temporaryHp
    let currentHp = character.currentHp

    // Сначала урон в temp HP
    if (tempHp > 0) {
      const absorbed = Math.min(tempHp, remainingDamage)
      tempHp -= absorbed
      remainingDamage -= absorbed
    }

    // Потом основной HP
    currentHp = Math.max(0, currentHp - remainingDamage)

    return characterRepository.updateHpState(id, {
      currentHp,
      temporaryHp: tempHp,
    })
  },

  async healCharacter(id: string, amount: number) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount < 0) {
      throw new ValidationError('Heal amount cannot be negative')
    }

    // ❗ Пока нет maxHp → просто увеличиваем
    // TODO: позже ограничить maxHp из calculation service
    return characterRepository.updateHpState(id, {
      currentHp: character.currentHp + amount,
      temporaryHp: character.temporaryHp,
    })
  },

  async setTempHp(id: string, amount: number) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount < 0) {
      throw new ValidationError('Temporary HP cannot be negative')
    }

    return characterRepository.updateHpState(id, {
      currentHp: character.currentHp,
      temporaryHp: amount,
    })
  },

  // =========================================================
  // Attacks
  // =========================================================

  async addAttack(characterId: string, data: CreateAttackInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return characterRepository.addAttack(characterId, data)
  },

  async updateAttack(characterId: string, attackId: string, data: UpdateAttackInput) {
    const attack = await characterRepository.findAttackById(attackId)

    if (!attack) {
      throw new AttackNotFoundError(attackId)
    }

    if (attack.characterId !== characterId) {
      throw new AttackOwnershipError(characterId, attackId)
    }

    return characterRepository.updateAttack(attackId, data)
  },

  async deleteAttack(characterId: string, attackId: string) {
    const attack = await characterRepository.findAttackById(attackId)

    if (!attack) {
      throw new AttackNotFoundError(attackId)
    }

    if (attack.characterId !== characterId) {
      throw new AttackOwnershipError(characterId, attackId)
    }

    await characterRepository.deleteAttack(attackId)
  },

  // =========================================================
  // Spells
  // =========================================================

  async addSpell(characterId: string, data: CreateSpellInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return characterRepository.addSpell(characterId, data)
  },

  async updateSpell(characterId: string, spellId: string, data: UpdateSpellInput) {
    const spell = await characterRepository.findSpellById(spellId)

    if (!spell) {
      throw new SpellNotFoundError(spellId)
    }

    if (spell.characterId !== characterId) {
      throw new SpellOwnershipError(characterId, spellId)
    }

    return characterRepository.updateSpell(spellId, data)
  },

  async deleteSpell(characterId: string, spellId: string) {
    const spell = await characterRepository.findSpellById(spellId)

    if (!spell) {
      throw new SpellNotFoundError(spellId)
    }

    if (spell.characterId !== characterId) {
      throw new SpellOwnershipError(characterId, spellId)
    }

    await characterRepository.deleteSpell(spellId)
  },

  // =========================================================
  // Spell slots
  // =========================================================

  async updateSpellSlots(characterId: string, spellSlots: SpellSlotItemInput[]) {
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

    // ✅ исправлено под repository
    return characterRepository.updateSpellSlots(characterId, {
      spellSlots,
    })
  },

  // =========================================================
  // Items / Inventory
  // =========================================================

  async getItemTemplates() {
    return characterRepository.findAllItemTemplates()
  },

  async addItem(characterId: string, data: CreateItemInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    let resolvedNameSnapshot = data.nameSnapshot

    if (data.itemTemplateId) {
      const template = await characterRepository.findItemTemplateById(
        data.itemTemplateId,
      )

      if (!template) {
        throw new ItemTemplateNotFoundError(data.itemTemplateId)
      }

      if (!resolvedNameSnapshot) {
        resolvedNameSnapshot = template.name
      }
    }

    if (!resolvedNameSnapshot) {
      throw new ValidationError(
        'nameSnapshot is required when itemTemplateId is not provided',
      )
    }

    if (data.isEquipped && !data.slot) {
      throw new ItemSlotMissingError()
    }

    if (data.isEquipped && data.slot) {
      const occupiedItem = await characterRepository.findEquippedItemBySlot(
        characterId,
        data.slot,
      )

      if (occupiedItem) {
        throw new ItemSlotAlreadyOccupiedError(data.slot, characterId)
      }
    }

    return characterRepository.addItem(characterId, {
      ...data,
      nameSnapshot: resolvedNameSnapshot,
    })
  },

  async updateItem(characterId: string, itemId: string, data: UpdateItemInput) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    return characterRepository.updateItem(itemId, data)
  },

  async deleteItem(characterId: string, itemId: string) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    await characterRepository.deleteItem(itemId)
  },

  async equipItem(characterId: string, itemId: string) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (item.isEquipped) {
      throw new ItemAlreadyEquippedError(itemId)
    }

    if (!item.slot) {
      throw new ItemSlotMissingError(itemId)
    }

    const occupiedItem = await characterRepository.findEquippedItemBySlot(
      characterId,
      item.slot,
    )

    if (occupiedItem && occupiedItem.id !== itemId) {
      throw new ItemSlotAlreadyOccupiedError(item.slot, characterId)
    }

    return characterRepository.equipItem(itemId)
  },

  async unequipItem(characterId: string, itemId: string) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (!item.isEquipped) {
      throw new ItemNotEquippedError(itemId)
    }

    return characterRepository.unequipItem(itemId)
  },
}