import { ValidationError } from '../../shared/errors'
import { characterRepository } from '../characters/character.repository'
import { CharacterNotFoundError } from '../characters/errors'

import {
  calculateHitDice,
  calculateMaxHp,
  getHpIncrease,
  getHpRuleForCharacter,
} from '../calculation/hp.rules'

export const characterHpService = {
  // =========================================================
  // HP
  // =========================================================

  // Повышает уровень персонажа на 1.
  //
  // Важно:
  // - уровень нельзя поднять выше 20
  // - повышение через обычный PATCH /characters/:id запрещено
  // - при повышении игрок выбирает hpMode: fixed или roll
  // - сервер сохраняет историю HP-прибавки
  // - после level up currentHp становится равен новому maxHp
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

  // Наносит урон персонажу.
  //
  // Правило:
  // 1. Урон сначала снимается с temporary HP.
  // 2. Остаток урона снимается с current HP.
  // 3. currentHp не может стать ниже 0.
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

    if (tempHp > 0) {
      const absorbed = Math.min(tempHp, remainingDamage)
      tempHp -= absorbed
      remainingDamage -= absorbed
    }

    currentHp = Math.max(0, currentHp - remainingDamage)

    return characterRepository.updateHpState(id, {
      currentHp,
      temporaryHp: tempHp,
    })
  },

  // Лечит персонажа.
  //
  // Правило:
  // - currentHp увеличивается на amount
  // - currentHp не может стать выше maxHp
  // - maxHp считается на сервере
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

  // Устанавливает temporary HP.
  //
  // Важно:
  // temporary HP не лечит персонажа.
  // Это отдельный буфер здоровья.
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
}