import { calculateMaxHp } from '../calculation/hp.rules'
import {
  rollAbilityScores,
  type AbilityScores,
} from '../calculation/stats.rules'
import { characterHpRepository } from '../character-hp/character-hp.repository'
import { characterStatsRepository } from './character-stats.repository'
import { CharacterNotFoundError } from '../characters/errors'
import { characterInventoryRepository } from '../character-inventory/character-inventory.repository'
import {
  calculateEffectiveMaxHp,
  normalizeItemEffects,
} from '../calculation/item-effects.rules'

async function calculateCharacterEffectiveMaxHp(
  characterId: string,
  baseMaxHp: number,
): Promise<number> {
  const items = await characterInventoryRepository.findByCharacterId(characterId)

  const equippedItems = items
    .filter((item) => item.isEquipped)
    .map((item) => ({
      effects: normalizeItemEffects(
        item.effects ?? item.itemTemplate?.effects ?? null,
      ),
    }))

  return calculateEffectiveMaxHp(baseMaxHp, equippedItems)
}

export const characterStatsService = {
  // Ручное обновление базовых характеристик персонажа.
  //
  // Логика:
  // 1. Проверяем, что персонаж существует.
  // 2. Сохраняем stats через upsert:
  //    - если stats есть — обновляем
  //    - если stats нет — создаём
  // 3. Пересчитываем base maxHp, потому что constitution влияет на HP 1 уровня.
  // 4. Добавляем hpBonus от экипированных предметов.
  // 5. Если currentHp стал выше нового effective maxHp — обрезаем currentHp.
  // 6. Возвращаем обновлённые stats.
  async updateCharacterStats(id: string, stats: AbilityScores) {
    const character = await characterHpRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const baseMaxHp = calculateMaxHp({
      ...character,
      stats,
      hpIncreases: character.hpIncreases ?? [],
    })

    const maxHp = await calculateCharacterEffectiveMaxHp(id, baseMaxHp)

    const updatedStats = await characterStatsRepository.upsertStatsAndClampHp(
      id,
      stats,
      character.currentHp > maxHp
        ? {
            currentHp: maxHp,
            temporaryHp: character.temporaryHp,
          }
        : undefined,
    )

    return updatedStats
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
    const character = await characterHpRepository.findByIdWithHpData(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const result = rollAbilityScores()

    const baseMaxHp = calculateMaxHp({
      ...character,
      stats: result.stats,
      hpIncreases: character.hpIncreases ?? [],
    })

    const maxHp = await calculateCharacterEffectiveMaxHp(id, baseMaxHp)

    const updatedStats = await characterStatsRepository.upsertStatsAndClampHp(
      id,
      result.stats,
      character.currentHp > maxHp
        ? {
            currentHp: maxHp,
            temporaryHp: character.temporaryHp,
          }
        : undefined,
    )

    return {
      stats: updatedStats,
      rolls: result.rolls,
    }
  },
}