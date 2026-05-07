import { httpClient } from './httpClient'
import type { Character, Stats } from '../types/characters'

// =========================================================
// CharacterSheet API
// =========================================================
// Этот файл отвечает только за полный лист персонажа.
//
// Он НЕ отвечает за:
// - список персонажей
// - создание / удаление персонажа
// - обычный CRUD профиля
// - старые actions атак / заклинаний / инвентаря
//
// Его задача:
// GET /characters/:id/sheet
// и тип вложенного ответа CharacterSheet.
// =========================================================

export type AbilityName = keyof Stats

// =========================================================
// Skills
// =========================================================
// Эти данные приходят уже рассчитанными с backend.
// Frontend не должен сам считать skill bonus.
// =========================================================

export type SkillBonus = {
  name: string
  ability: AbilityName
  proficient: boolean
  expertise: boolean
  bonus: number
}

// =========================================================
// Saving Throws
// =========================================================
// Эти данные приходят уже рассчитанными с backend.
// Frontend не должен сам считать saving throw bonus.
// =========================================================

export type SavingThrowBonus = {
  ability: AbilityName
  label: string
  proficient: boolean
  bonus: number
}

export type CharacterSheet = {
  // =======================================================
  // Базовый профиль персонажа
  // =======================================================
  // Это сохранённая сущность Character без связанных таблиц.
  // HP и temp HP лежат здесь, потому что это состояние персонажа.
  // =======================================================

  character: {
    id: string
    name: string
    race: string
    className: string
    level: number

    description: string | null
    alignment: string | null
    background: string | null
    avatarUrl: string | null

    currentHp: number
    temporaryHp: number
    speed: number
    inspiration: boolean

    createdAt: string | Date
    updatedAt: string | Date
  }

  // =======================================================
  // Характеристики
  // =======================================================
  // base — то, что хранится в БД.
  // final — итоговые значения после эффектов.
  // modifiers — модификаторы от final stats.
  // =======================================================

  stats: {
    base: Stats
    final: Stats
    modifiers: Stats
  }

  // =======================================================
  // Derived values
  // =======================================================
  // Всё это считается backend-ом.
  // Frontend только отображает эти значения.
  // =======================================================

  derived: {
    maxHp: number
    armorClass: number
    initiative: number
    passivePerception: number
    proficiencyBonus: number
    spellAttackBonus: number | null
    spellSaveDc: number | null
  }

  deathSaves: {
    successes: number
    failures: number
  }

  // =======================================================
  // Навыки
  // =======================================================
  // Backend возвращает уже готовый список навыков с бонусами.
  // CharacterSheet.tsx должен только отображать эти значения.
  // =======================================================

  skills: SkillBonus[]

  // =======================================================
  // Спасброски
  // =======================================================
  // Backend возвращает уже готовый список спасбросков с бонусами.
  // CharacterSheet.tsx должен только отображать эти значения.
  // =======================================================

  savingThrows: SavingThrowBonus[]

  // =======================================================
  // Атаки
  // =======================================================

  attacks: Character['attacks']

  // =======================================================
  // Магия
  // =======================================================

  magic: {
    spells: Character['spells']
    spellSlots: Character['spellSlots']
    spellcastingAbility: AbilityName | null
  }

  // =======================================================
  // Инвентарь
  // =======================================================

  inventory: {
    items: Character['inventory']
    equippedItems: Character['inventory']
  }

  // =======================================================
  // Прогрессия персонажа
  // =======================================================

  progression: {
    hitDice: {
      total: number
      used: number
      dice: string
    }
    hpIncreases: unknown[]
  }
}

// =========================================================
// Requests
// =========================================================

export async function getCharacterSheet(
  characterId: string,
): Promise<CharacterSheet> {
  return httpClient.get<CharacterSheet>(`/characters/${characterId}/sheet`)
}