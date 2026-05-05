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

type HpMode = 'fixed' | 'roll'

type HpRule = {
  hitDie: number        // например 8 (d8)
  levelOneBase: number  // максимум кости (например 8)
  fixedPerLevel: number // среднее значение (например 5)
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

export function getHpRuleForCharacter(character: any): HpRule {
  // 🔥 Пока хардкод
  // В будущем:
  // switch (character.class) { ... }

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

export function rollHitDie(hitDie: number): number {
  return Math.floor(Math.random() * hitDie) + 1
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
  character: any,
  mode: HpMode
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

export function calculateMaxHp(character: any): number {
  const rule = getHpRuleForCharacter(character)

  const constitution = character.stats?.constitution ?? 10
  const conModifier = getConModifier(constitution)

  // 1 уровень
  const baseHp = rule.levelOneBase + conModifier

  // прибавки с уровней
  const increases =
    character.hpIncreases?.reduce(
      (sum: number, inc: any) => sum + inc.value,
      0
    ) ?? 0

  return baseHp + increases
}

// =========================
// HIT DICE CALCULATION
// =========================

export function calculateHitDice(character: any) {
  const rule = getHpRuleForCharacter(character)

  return {
    total: character.level,
    used: character.hitDiceUsed ?? 0,
    dice: `1d${rule.hitDie}`,
  }
}