import type { AbilityName, AbilityScores } from './stats.rules'

// =========================================================
// SKILLS RULES
// =========================================================
// Здесь лежит чистая серверная логика расчёта навыков.
//
// В этом файле НЕ должно быть:
// - Prisma
// - Fastify
// - HTTP
// - repository
// - работы с БД
//
// CharacterSheetService будет только вызывать эти функции
// и добавлять готовый результат в GET /characters/:id/sheet.
// =========================================================

// =========================================================
// Навык персонажа
// =========================================================
// name       — название для отображения
// ability    — характеристика, от которой считается навык
// proficient — есть ли владение навыком
// expertise  — есть ли экспертиза, то есть двойной proficiency
// bonus      — дополнительный плоский бонус, например от предмета/эффекта
// =========================================================

export type SkillDefinition = {
  name: string
  ability: AbilityName
}

export type SkillState = {
  name: string
  proficient?: boolean
  expertise?: boolean
  bonus?: number
}

export type SkillBonus = {
  name: string
  ability: AbilityName
  proficient: boolean
  expertise: boolean
  bonus: number
}

// =========================================================
// Стандартный список навыков D&D 5e
// =========================================================
// Пока это справочник внутри rules-файла.
// Позже, если понадобится кастомизация мира, можно вынести
// навыки в справочник/таблицу.
// =========================================================

export const standardSkills: SkillDefinition[] = [
  { name: 'Акробатика', ability: 'dexterity' },
  { name: 'Анализ', ability: 'intelligence' },
  { name: 'Атлетика', ability: 'strength' },
  { name: 'Внимательность', ability: 'wisdom' },
  { name: 'Выживание', ability: 'wisdom' },
  { name: 'Выступление', ability: 'charisma' },
  { name: 'Запугивание', ability: 'charisma' },
  { name: 'История', ability: 'intelligence' },
  { name: 'Ловкость рук', ability: 'dexterity' },
  { name: 'Магия', ability: 'intelligence' },
  { name: 'Медицина', ability: 'wisdom' },
  { name: 'Обман', ability: 'charisma' },
  { name: 'Природа', ability: 'intelligence' },
  { name: 'Проницательность', ability: 'wisdom' },
  { name: 'Религия', ability: 'intelligence' },
  { name: 'Скрытность', ability: 'dexterity' },
  { name: 'Убеждение', ability: 'charisma' },
  { name: 'Уход за животными', ability: 'wisdom' },
]

// =========================================================
// calculateSkillBonus
// =========================================================
// Считает итоговый бонус одного навыка.
//
// Формула:
// ability modifier
// + proficiencyBonus, если proficient
// + ещё proficiencyBonus, если expertise
// + flat bonus
//
// Пока SkillState можно не передавать.
// Тогда proficient/expertise будут false.
// =========================================================

export function calculateSkillBonus(input: {
  abilityModifier: number
  proficiencyBonus: number
  proficient?: boolean
  expertise?: boolean
  bonus?: number
}): number {
  const proficient = input.proficient ?? false
  const expertise = input.expertise ?? false
  const flatBonus = input.bonus ?? 0

  return (
    input.abilityModifier +
    (proficient ? input.proficiencyBonus : 0) +
    (expertise ? input.proficiencyBonus : 0) +
    flatBonus
  )
}

// =========================================================
// calculateSkillBonuses
// =========================================================
// Считает все навыки для character sheet.
//
// skillStates — будущая точка подключения CharacterSkillState из БД.
// Сейчас можно передавать пустой массив.
// =========================================================

export function calculateSkillBonuses(input: {
  modifiers: AbilityScores
  proficiencyBonus: number
  skillStates?: SkillState[]
}): SkillBonus[] {
  const skillStates = input.skillStates ?? []

  return standardSkills.map((skill) => {
    const state = skillStates.find((entry) => entry.name === skill.name)

    const proficient = state?.proficient ?? false
    const expertise = state?.expertise ?? false
    const flatBonus = state?.bonus ?? 0

    return {
      name: skill.name,
      ability: skill.ability,
      proficient,
      expertise,
      bonus: calculateSkillBonus({
        abilityModifier: input.modifiers[skill.ability],
        proficiencyBonus: input.proficiencyBonus,
        proficient,
        expertise,
        bonus: flatBonus,
      }),
    }
  })
}

// =========================================================
// calculatePassivePerception
// =========================================================
// Пассивное восприятие = 10 + бонус навыка восприятия.
//
// Важно:
// на фронте раньше могло быть "Восприятие",
// а в текущем списке у нас "Внимательность".
// Чтобы не словить несовпадение названий, проверяем оба варианта.
// =========================================================

export function calculatePassivePerception(skills: SkillBonus[]): number {
  const perceptionSkill = skills.find(
    (skill) => skill.name === 'Внимательность' || skill.name === 'Восприятие',
  )

  return 10 + (perceptionSkill?.bonus ?? 0)
}