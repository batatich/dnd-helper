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

import {
  calculateHitDice,
  calculateMaxHp,
  getHpIncrease,
  getHpRuleForCharacter,
} from '../calculation/hp.rules'

import {
  rollAbilityScores,
  type AbilityScores,
} from '../calculation/stats.rules'

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
    },

     // =========================================================
  // STATS
  // =========================================================

  // Ручное обновление базовых характеристик персонажа.
  //
  // Логика:
  // 1. Проверяем, что персонаж существует.
  // 2. Сохраняем stats через upsert:
  //    - если stats есть — обновляем
  //    - если stats нет — создаём
  // 3. Пересчитываем maxHp, потому что constitution влияет на HP 1 уровня.
  // 4. Если currentHp стал выше нового maxHp — обрезаем currentHp.
  // 5. Возвращаем обновлённого персонажа вместе с данными листа.
  async updateCharacterStats(id: string, stats: AbilityScores) {
    const character = await characterRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const updatedStats = await characterRepository.upsertStats(id, stats)

    const maxHp = calculateMaxHp({
      ...character,
      stats: updatedStats,
      hpIncreases: character.hpIncreases ?? [],
    })

    if (character.currentHp > maxHp) {
      await characterRepository.updateHpState(id, {
        currentHp: maxHp,
        temporaryHp: character.temporaryHp,
      })
    }

    return characterRepository.findByIdWithSheet(id)
  },

  // Генерация базовых характеристик через 4d6 drop lowest.
  //
  // Для каждого стата сервер:
  // 1. кидает 4d6
  // 2. убирает минимальный куб
  // 3. складывает оставшиеся 3
  //
  // Важно:
  // фронт НЕ кидает кубы сам.
  // Фронт только вызывает endpoint, а сервер возвращает результат.
  async rollCharacterStats(id: string) {
    const character = await characterRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const result = rollAbilityScores()

    const updatedStats = await characterRepository.upsertStats(
      id,
      result.stats,
    )

    const maxHp = calculateMaxHp({
      ...character,
      stats: updatedStats,
      hpIncreases: character.hpIncreases ?? [],
    })

    if (character.currentHp > maxHp) {
      await characterRepository.updateHpState(id, {
        currentHp: maxHp,
        temporaryHp: character.temporaryHp,
      })
    }

    const updatedCharacter = await characterRepository.findByIdWithSheet(id)

    return {
      character: updatedCharacter,
      stats: updatedStats,
      rolls: result.rolls,
    }
  },

  // =========================================================
  // HP
  // =========================================================
  async levelUpCharacter(id: string, hpMode: 'fixed' | 'roll') {
    const character = await characterRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (character.level >= 20) {
      throw new ValidationError('Character level cannot be higher than 20')
    }

    const nextLevel = character.level + 1

    const existingHpIncrease = await characterRepository.findHpIncreaseByLevel(
      id,
      nextLevel,
    )

    if (existingHpIncrease) {
      throw new ValidationError(
        `HP increase for level ${nextLevel} already exists`,
      )
    }

    const hpRule = getHpRuleForCharacter(character)
    const hpIncrease = getHpIncrease(character, hpMode)
    const hitDice = calculateHitDice({
      ...character,
      level: nextLevel,
    })

    await characterRepository.createHpIncrease(id, {
      level: nextLevel,
      mode: hpMode,
      value: hpIncrease.value,
      dice: `1d${hpRule.hitDie}`,
      rolledValue: hpIncrease.rolledValue ?? null,
    })

    const updatedCharacterForCalculation =
      await characterRepository.findByIdWithHpData(id)

    if (!updatedCharacterForCalculation) {
      throw new CharacterNotFoundError(id)
    }

    const maxHp = calculateMaxHp({
      ...updatedCharacterForCalculation,
      level: nextLevel,
    })

    return characterRepository.updateLevelAndHpState(id, {
      level: nextLevel,
      currentHp: maxHp,
      temporaryHp: character.temporaryHp,
      hitDiceTotal: hitDice.total,
      hitDiceDice: hitDice.dice,
    })
  },
  
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
    const character = await characterRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount < 0) {
      throw new ValidationError('Heal amount cannot be negative')
    }

    const maxHp = calculateMaxHp(character)

    return characterRepository.updateHpState(id, {
      currentHp: Math.min(character.currentHp + amount, maxHp),
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