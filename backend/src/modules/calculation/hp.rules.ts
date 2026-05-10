// =========================
// HP RULES (D&D logic layer)
// =========================

/**
 * Это слой игровой логики.
 * Здесь НЕ должно быть:
 * - prisma
 * - http
 * - store
 *
 * Только чистые функции.
 */

export type HpMode = 'fixed' | 'roll'

export type HpRule = {
  hitDie: number
  levelOneBase: number
  fixedPerLevel: number
}

type HpIncreaseLike = {
  value: number
}

type CharacterForHpCalculation = {
  level: number
  hitDiceUsed?: number | null
  stats?: {
    constitution?: number | null
  } | null
  hpIncreases?: HpIncreaseLike[] | null
}

export type HitDiceState = {
  total: number
  used: number
  dice: string
}

// =========================
// ВРЕМЕННОЕ ПРАВИЛО (без классов)
// =========================

const DEFAULT_HP_RULE: HpRule = {
  hitDie: 8,
  levelOneBase: 8,
  fixedPerLevel: 5,
}

// =========================
// ЗАГОТОВКА ПОД КЛАССЫ
// =========================

export function getHpRuleForCharacter(
  _character: CharacterForHpCalculation,
): HpRule {
  // Пока хардкод.
  // В будущем:
  // switch (character.className или character.class) { ... }

  return DEFAULT_HP_RULE
}

// =========================
// CON MODIFIER
// =========================

export function getConModifier(constitution: number): number {
  return Math.floor((constitution - 10) / 2)
}

// =========================
// ROLL HIT DIE
// =========================

export function rollHitDie(sides = 8) {
  const safeSides = Math.max(1, Math.floor(sides))

  return Math.floor(Math.random() * safeSides) + 1
}

// =========================
// FIXED HP INCREASE
// =========================

export function getFixedHpIncrease(rule: HpRule): number {
  return rule.fixedPerLevel
}

// =========================
// HP INCREASE (LEVEL UP)
// =========================

export function getHpIncrease(
  character: CharacterForHpCalculation,
  mode: HpMode,
): { value: number; rolledValue?: number } {
  const rule = getHpRuleForCharacter(character)

  if (mode === 'fixed') {
    return {
      value: getFixedHpIncrease(rule),
    }
  }

  const roll = rollHitDie(rule.hitDie)

  return {
    value: roll,
    rolledValue: roll,
  }
}

// =========================
// MAX HP CALCULATION
// =========================

export function calculateMaxHp(character: CharacterForHpCalculation): number {
  const rule = getHpRuleForCharacter(character)

  const constitution = character.stats?.constitution ?? 10
  const conModifier = getConModifier(constitution)

  const baseHp = rule.levelOneBase + conModifier

  const increases =
    character.hpIncreases?.reduce((sum, increase) => {
      return sum + increase.value
    }, 0) ?? 0

  return baseHp + increases
}

// =========================
// HIT DICE CALCULATION
// =========================

export function calculateHitDice(
  character: CharacterForHpCalculation,
): HitDiceState {
  const rule = getHpRuleForCharacter(character)

  return {
    total: character.level,
    used: character.hitDiceUsed ?? 0,
    dice: `1d${rule.hitDie}`,
  }
}

// =========================================================
// HIT DICE ACTIONS
// =========================================================
// Эти функции меняют только количество использованных костей хитов.
//
// total считается от уровня персонажа:
// hitDice.total = character.level
//
// used хранится в Character.hitDiceUsed.
//
// Правила:
// - used не может быть меньше 0
// - used не может быть больше total
// - useHitDie увеличивает used на 1
// - restoreHitDie уменьшает used на 1
// =========================================================



export class HitDiceConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HitDiceConflictError'
  }
}

function clampHitDiceUsed(used: number, total: number): number {
  return Math.min(Math.max(used, 0), total)
}

export function normalizeHitDice(
  character: CharacterForHpCalculation,
): HitDiceState {
  const hitDice = calculateHitDice(character)

  return {
    ...hitDice,
    used: clampHitDiceUsed(hitDice.used, hitDice.total),
  }
}

export function useHitDie(character: CharacterForHpCalculation): HitDiceState {
  const hitDice = normalizeHitDice(character)

  if (hitDice.total <= 0) {
    throw new HitDiceConflictError('Character has no hit dice')
  }

  if (hitDice.used >= hitDice.total) {
    throw new HitDiceConflictError('All hit dice are already used')
  }

  return {
    ...hitDice,
    used: hitDice.used + 1,
  }
}

export function restoreHitDie(
  character: CharacterForHpCalculation,
): HitDiceState {
  const hitDice = normalizeHitDice(character)

  if (hitDice.used <= 0) {
    throw new HitDiceConflictError('No used hit dice to restore')
  }

  return {
    ...hitDice,
    used: hitDice.used - 1,
  }
}

// =========================================================
// Death saves
// =========================================================

export type DeathSavesState = {
  successes: number
  failures: number
}

function clampDeathSaveValue(value: number): number {
  return Math.min(Math.max(value, 0), 3)
}

export function normalizeDeathSaves(input: DeathSavesState): DeathSavesState {
  return {
    successes: clampDeathSaveValue(input.successes),
    failures: clampDeathSaveValue(input.failures),
  }
}

export function addDeathSaveSuccess(input: DeathSavesState): DeathSavesState {
  const current = normalizeDeathSaves(input)

  return {
    ...current,
    successes: clampDeathSaveValue(current.successes + 1),
  }
}

export function addDeathSaveFailure(input: DeathSavesState): DeathSavesState {
  const current = normalizeDeathSaves(input)

  return {
    ...current,
    failures: clampDeathSaveValue(current.failures + 1),
  }
}

export function resetDeathSaves(): DeathSavesState {
  return {
    successes: 0,
    failures: 0,
  }
}