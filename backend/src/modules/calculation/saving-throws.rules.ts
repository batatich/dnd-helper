import type { AbilityName, AbilityScores } from './stats.rules'
import { abilityNames } from './stats.rules'

// =========================================================
// SAVING THROWS RULES
// =========================================================
// Здесь лежит чистая серверная логика расчёта спасбросков.
//
// В этом файле НЕ должно быть:
// - Prisma
// - Fastify
// - HTTP
// - repository
// - работы с БД
//
// CharacterSheetService будет вызывать эти функции
// и добавлять готовый результат в GET /characters/:id/sheet.
// =========================================================

export type SavingThrowState = {
  ability: AbilityName
  proficient?: boolean
  bonus?: number
}

export type SavingThrowBonus = {
  ability: AbilityName
  label: string
  proficient: boolean
  bonus: number
}

// =========================================================
// Подписи характеристик для UI
// =========================================================

export const savingThrowLabels: Record<AbilityName, string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
}

// =========================================================
// calculateSavingThrowBonus
// =========================================================
// Считает бонус одного спасброска.
//
// Формула:
// ability modifier
// + proficiencyBonus, если proficient
// + flat bonus
// =========================================================

export function calculateSavingThrowBonus(input: {
  abilityModifier: number
  proficiencyBonus: number
  proficient?: boolean
  bonus?: number
}): number {
  const proficient = input.proficient ?? false
  const flatBonus = input.bonus ?? 0

  return (
    input.abilityModifier +
    (proficient ? input.proficiencyBonus : 0) +
    flatBonus
  )
}

// =========================================================
// calculateSavingThrows
// =========================================================
// Считает все 6 спасбросков для character sheet.
//
// savingThrowStates — будущая точка подключения
// CharacterSavingThrowState из БД.
// Сейчас можно передавать пустой массив.
// =========================================================

export function calculateSavingThrows(input: {
  modifiers: AbilityScores
  proficiencyBonus: number
  savingThrowStates?: SavingThrowState[]
}): SavingThrowBonus[] {
  const savingThrowStates = input.savingThrowStates ?? []

  return abilityNames.map((ability) => {
    const state = savingThrowStates.find((entry) => entry.ability === ability)

    const proficient = state?.proficient ?? false
    const flatBonus = state?.bonus ?? 0

    return {
      ability,
      label: savingThrowLabels[ability],
      proficient,
      bonus: calculateSavingThrowBonus({
        abilityModifier: input.modifiers[ability],
        proficiencyBonus: input.proficiencyBonus,
        proficient,
        bonus: flatBonus,
      }),
    }
  })
}