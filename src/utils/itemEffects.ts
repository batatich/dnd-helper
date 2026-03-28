import type { ItemEffect } from '../types/items'

export function formatItemEffect(effect: ItemEffect): string {
  if (effect.stat && effect.value !== undefined) {
    const statLabels: Record<string, string> = {
      strength: 'Силе',
      dexterity: 'Ловкости',
      constitution: 'Телосложению',
      intelligence: 'Интеллекту',
      wisdom: 'Мудрости',
      charisma: 'Харизме',
    }

    return `+${effect.value} к ${statLabels[effect.stat]}`
  }

  if (effect.hpBonus !== undefined) {
    return `+${effect.hpBonus} HP`
  }

  if (effect.armorClassBonus !== undefined) {
    return `+${effect.armorClassBonus} AC`
  }

  if (effect.initiativeBonus !== undefined) {
    return `+${effect.initiativeBonus} к инициативе`
  }

  return 'Без эффекта'
}