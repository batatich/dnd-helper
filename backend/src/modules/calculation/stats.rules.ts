// =========================================================
// STATS RULES
// =========================================================
// Здесь лежит чистая игровая логика для характеристик.
//
// В этом файле НЕ должно быть:
// - Prisma
// - Fastify
// - HTTP
// - repository
// - работы с БД
//
// Только расчёты и броски кубов.
// =========================================================

// =========================================================
// Список базовых характеристик персонажа
// =========================================================

export type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'

// =========================================================
// Значения характеристик персонажа
// =========================================================

export type AbilityScores = Record<AbilityName, number>

// =========================================================
// Подробный результат броска 4d6 drop lowest для одного стата
// =========================================================

export type AbilityRollResult = {
  // Все выпавшие значения на 4 кубиках d6.
  dice: number[]

  // Самое маленькое значение, которое было отброшено.
  dropped: number

  // Итоговое значение стата:
  // сумма 3 лучших кубиков.
  total: number
}

// =========================================================
// Результат генерации всех 6 характеристик
// =========================================================

export type RolledAbilityScores = {
  stats: AbilityScores
  rolls: Record<AbilityName, AbilityRollResult>
}

// =========================================================
// Порядок характеристик
// =========================================================
// Используем один общий список, чтобы не дублировать названия
// по разным файлам.

export const abilityNames: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
]

// =========================================================
// Бросок одного d6
// =========================================================

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1
}

// =========================================================
// Бросок характеристики: 4d6 drop lowest
// =========================================================
// Логика:
// 1. бросаем 4 кубика d6
// 2. находим минимальный кубик
// 3. отбрасываем его
// 4. суммируем оставшиеся 3 значения
//
// Пример:
// dice = [6, 4, 3, 1]
// dropped = 1
// total = 13

export function rollAbilityScore(): AbilityRollResult {
  const dice = [rollD6(), rollD6(), rollD6(), rollD6()]
  const dropped = Math.min(...dice)

  const total = dice.reduce((sum, value) => sum + value, 0) - dropped

  return {
    dice,
    dropped,
    total,
  }
}

// =========================================================
// Генерация всех характеристик персонажа
// =========================================================
// Для каждого из 6 статов отдельно бросается 4d6 drop lowest.

export function rollAbilityScores(): RolledAbilityScores {
  const stats = {} as AbilityScores
  const rolls = {} as Record<AbilityName, AbilityRollResult>

  for (const ability of abilityNames) {
    const result = rollAbilityScore()

    stats[ability] = result.total
    rolls[ability] = result
  }

  return {
    stats,
    rolls,
  }
}

// =========================================================
// Расчёт модификатора характеристики
// =========================================================
// Формула D&D:
// modifier = floor((stat - 10) / 2)
//
// Примеры:
// 10 → 0
// 12 → +1
// 14 → +2
// 8  → -1
// 7  → -2

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// =========================================================
// Расчёт всех модификаторов
// =========================================================

export function getAbilityModifiers(scores: AbilityScores): AbilityScores {
  return {
    strength: getAbilityModifier(scores.strength),
    dexterity: getAbilityModifier(scores.dexterity),
    constitution: getAbilityModifier(scores.constitution),
    intelligence: getAbilityModifier(scores.intelligence),
    wisdom: getAbilityModifier(scores.wisdom),
    charisma: getAbilityModifier(scores.charisma),
  }
}

// =========================================================
// Валидация значения характеристики
// =========================================================
// Для ручного ввода.
// Сейчас делаем мягкий диапазон 1–30.
// Позже можно будет заменить на правила конкретного мира.

export function isValidAbilityScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 30
}

// =========================================================
// Проверка полного набора характеристик
// =========================================================

export function validateAbilityScores(scores: AbilityScores): boolean {
  return abilityNames.every((ability) => isValidAbilityScore(scores[ability]))
}

export function normalizeAbilityName(
  ability: AbilityName | string | null | undefined,
): AbilityName | null {
  if (
    ability === 'strength' ||
    ability === 'dexterity' ||
    ability === 'constitution' ||
    ability === 'intelligence' ||
    ability === 'wisdom' ||
    ability === 'charisma'
  ) {
    return ability
  }

  return null
}