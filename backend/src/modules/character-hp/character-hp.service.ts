import { ValidationError } from '../../shared/errors'
import { characterHpRepository } from './character-hp.repository'
import { characterRepository } from '../characters/character.repository'
import { CharacterNotFoundError } from '../characters/errors'

import {
  addDeathSaveFailure,
  addDeathSaveSuccess,
  calculateHitDice,
  calculateMaxHp,
  getHpIncrease,
  getHpRuleForCharacter,
  HitDiceConflictError,
  resetDeathSaves,
  restoreHitDie,
  useHitDie,
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
    const character = await characterHpRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (character.level >= 20) {
      throw new ValidationError('Character level cannot be higher than 20')
    }

    const nextLevel = character.level + 1

    const existingHpIncrease = await characterHpRepository.findHpIncreaseByLevel(
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

    const nextHpIncreases = [
      ...(character.hpIncreases ?? []),
      {
        value: hpIncrease.value,
      },
    ]

    const maxHp = calculateMaxHp({
      ...character,
      level: nextLevel,
      hpIncreases: nextHpIncreases,
    })

    return characterHpRepository.levelUpWithHpIncrease(
      id,
      {
        level: nextLevel,
        mode: hpMode,
        value: hpIncrease.value,
        dice: `1d${hpRule.hitDie}`,
        rolledValue: hpIncrease.rolledValue ?? null,
      },
      {
        level: nextLevel,
        currentHp: maxHp,
        temporaryHp: character.temporaryHp,
        hitDiceTotal: hitDice.total,
        hitDiceDice: hitDice.dice,
      },
    )
  },

  // Наносит урон персонажу.
  //
  // Правило:
  // 1. Урон сначала снимается с temporary HP.
  // 2. Остаток урона снимается с current HP.
  // 3. currentHp не может стать ниже 0.
  async damageCharacter(id: string, amount: number) {
    const character = await characterHpRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount <= 0) {
      throw new ValidationError('Damage amount must be positive')
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

    return characterHpRepository.updateHpState(id, {
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
    const character = await characterHpRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount <= 0) {
      throw new ValidationError('Heal amount must be positive')
    }

    const maxHp = calculateMaxHp(character)

    return characterHpRepository.updateHpState(id, {
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
    const character = await characterHpRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    if (amount < 0) {
      throw new ValidationError('Temporary HP cannot be negative')
    }

    return characterHpRepository.updateHpState(id, {
      currentHp: character.currentHp,
      temporaryHp: amount,
    })
  },

  // =========================================================
  // Hit dice
  // =========================================================

  // Использует 1 кость хитов.
  async useHitDie(id: string) {
    const character = await characterHpRepository.findHitDiceByCharacterId(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    let nextHitDice

    try {
      nextHitDice = useHitDie({
        level: character.level,
        hitDiceUsed: character.hitDiceUsed,
      })
    } catch (error) {
      if (error instanceof HitDiceConflictError) {
        throw new ValidationError(error.message)
      }

      throw error
    }

    return characterHpRepository.updateHitDiceUsed(id, nextHitDice.used)
  },

  // Восстанавливает 1 использованную кость хитов.
  async restoreHitDie(id: string) {
    const character = await characterHpRepository.findHitDiceByCharacterId(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    let nextHitDice

    try {
      nextHitDice = restoreHitDie({
        level: character.level,
        hitDiceUsed: character.hitDiceUsed,
      })
    } catch (error) {
      if (error instanceof HitDiceConflictError) {
        throw new ValidationError(error.message)
      }

      throw error
    }

    return characterHpRepository.updateHitDiceUsed(id, nextHitDice.used)
  },

  // =========================================================
  // Inspiration
  // =========================================================

  // Устанавливает вдохновение персонажа.
  async setInspiration(id: string, inspiration: boolean) {
    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return characterHpRepository.updateInspiration(id, inspiration)
  },

  // =========================================================
  // Death saves
  // =========================================================

  // Добавляет 1 успешный спасбросок от смерти.
  async addDeathSaveSuccess(id: string) {
    const character = await characterHpRepository.findDeathSavesByCharacterId(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const nextDeathSaves = addDeathSaveSuccess({
      successes: character.deathSaveSuccesses,
      failures: character.deathSaveFailures,
    })

    return characterHpRepository.updateDeathSaves(id, nextDeathSaves)
  },

  // Добавляет 1 проваленный спасбросок от смерти.
  async addDeathSaveFailure(id: string) {
    const character = await characterHpRepository.findDeathSavesByCharacterId(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const nextDeathSaves = addDeathSaveFailure({
      successes: character.deathSaveSuccesses,
      failures: character.deathSaveFailures,
    })

    return characterHpRepository.updateDeathSaves(id, nextDeathSaves)
  },

  // Сбрасывает спасброски от смерти.
  async resetDeathSaves(id: string) {
    const character = await characterHpRepository.findDeathSavesByCharacterId(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return characterHpRepository.updateDeathSaves(id, resetDeathSaves())
  },
}