export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  class: string;
  race: string;
  attributes: Attributes;
}

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}