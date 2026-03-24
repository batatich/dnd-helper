// Характеристики
export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// Персонаж
export interface Character {
  id: string;
  name: string;
  level: number;
  class: string;
  race: string;
  attributes: Attributes;
  background?: string;      // предыстория
  alignment?: string;       // мировоззрение
  experience?: number;      // опыт
  armorClass?: number;      // Класс Доспеха
  maxHp?: number;           // максимальные хиты
  currentHp?: number;       // текущие хиты
}

// Модификатор характеристики
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}