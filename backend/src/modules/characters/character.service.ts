import type {
  CreateAttackInput,
  CreateCharacterInput,
  CreateItemInput,
  CreateSpellInput,
  SpellSlotItemInput,
  UpdateAttackInput,
  UpdateCharacterInput,
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

  // Получить список всех персонажей
  async getCharacters() {
    return characterRepository.findAll()
  },

  // Получить персонажа по ID
  async getCharacterById(id: string) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return character
  },

  // Создать нового персонажа
  async createCharacter(data: CreateCharacterInput) {
    return characterRepository.create(data)
  },

  // Обновить базовые данные персонажа
  async updateCharacter(id: string, data: UpdateCharacterInput) {
    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    return characterRepository.update(id, data)
  },

  // Удалить персонажа
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

  // Нанести урон персонажу с учётом temporary HP
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

    // Сначала урон поглощается временными HP
    if (tempHp > 0) {
      const absorbed = Math.min(tempHp, remainingDamage)
      tempHp -= absorbed
      remainingDamage -= absorbed
    }

    // Оставшийся урон уменьшает текущие HP
    currentHp = Math.max(0, currentHp - remainingDamage)

    return characterRepository.updateHpState(id, {
      currentHp,
      temporaryHp: tempHp,
    })
  },

  // Исцелить персонажа
  async healCharacter(id: string, amount: number) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount < 0) {
      throw new ValidationError('Heal amount cannot be negative')
    }

    return characterRepository.updateHpState(id, {
      currentHp: character.currentHp + amount,
      temporaryHp: character.temporaryHp,
    })
  },

  // Установить значение temporary HP
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

  // Добавить атаку персонажу
  async addAttack(characterId: string, data: CreateAttackInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return characterRepository.addAttack(characterId, data)
  },

  // Обновить атаку персонажа
  async updateAttack(
    characterId: string,
    attackId: string,
    data: UpdateAttackInput,
  ) {
    const attack = await characterRepository.findAttackById(attackId)

    if (!attack) {
      throw new AttackNotFoundError(attackId)
    }

    if (attack.characterId !== characterId) {
      throw new AttackOwnershipError(characterId, attackId)
    }

    return characterRepository.updateAttack(attackId, data)
  },

  // Удалить атаку персонажа
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

  // Добавить заклинание персонажу
  async addSpell(characterId: string, data: CreateSpellInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    return characterRepository.addSpell(characterId, data)
  },

  // Обновить заклинание персонажа
  async updateSpell(
    characterId: string,
    spellId: string,
    data: UpdateSpellInput,
  ) {
    const spell = await characterRepository.findSpellById(spellId)

    if (!spell) {
      throw new SpellNotFoundError(spellId)
    }

    if (spell.characterId !== characterId) {
      throw new SpellOwnershipError(characterId, spellId)
    }

    return characterRepository.updateSpell(spellId, data)
  },

  // Удалить заклинание персонажа
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

  // Обновить spell slots персонажа
  async updateSpellSlots(
    characterId: string,
    spellSlots: SpellSlotItemInput[],
  ) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    // Базовая доменная проверка:
    // использованных слотов не может быть больше, чем доступных
    for (const slot of spellSlots) {
      if (slot.used > slot.total) {
        throw new ValidationError(
          `Used spell slots cannot exceed total for level ${slot.level}`,
        )
      }
    }

    return characterRepository.updateSpellSlots(characterId, spellSlots)
  },

  // =========================================================
  // Items / Inventory
  // =========================================================

  // Получить список всех item templates
  async getItemTemplates() {
    return characterRepository.findAllItemTemplates()
  },

  // Добавить предмет в инвентарь персонажа
  async addItem(characterId: string, data: CreateItemInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    // Количество предметов должно быть положительным
    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    let resolvedNameSnapshot = data.nameSnapshot

    // Если предмет создаётся из шаблона — проверяем существование шаблона
    // и при необходимости берём имя из template
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

    // Для кастомного предмета имя обязательно
    if (!resolvedNameSnapshot) {
      throw new ValidationError(
        'nameSnapshot is required when itemTemplateId is not provided',
      )
    }

    // Если предмет сразу создаётся как экипированный,
    // у него обязательно должен быть слот
    if (data.isEquipped && !data.slot) {
      throw new ItemSlotMissingError()
    }

    // Если слот указан и предмет сразу экипирован,
    // проверяем, не занят ли слот другим предметом
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

  // Обновить предмет персонажа
  async updateItem(characterId: string, itemId: string, data: UpdateItemInput) {
    const item = await characterRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    // Проверка количества
    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    // Определяем итоговое состояние предмета после обновления
    const nextIsEquipped = data.isEquipped ?? item.isEquipped
    const nextSlot =
      data.slot !== undefined ? data.slot : (item.slot ?? undefined)

    // Если предмет должен быть экипирован, слот обязателен
    if (nextIsEquipped && !nextSlot) {
      throw new ItemSlotMissingError(itemId)
    }

    // Если предмет должен быть экипирован и слот есть —
    // проверяем, не занят ли он другим предметом
    if (nextIsEquipped && nextSlot) {
      const occupiedItem = await characterRepository.findEquippedItemBySlot(
        characterId,
        nextSlot,
      )

      if (occupiedItem && occupiedItem.id !== itemId) {
        throw new ItemSlotAlreadyOccupiedError(nextSlot, characterId)
      }
    }

    return characterRepository.updateItem(itemId, data)
  },

  // Удалить предмет персонажа
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

  // Экипировать предмет
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

  // Снять предмет
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