
export interface Character {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  attributes: Attributes;
  equipment: string[];
}

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}
export interface AttributeModifier {
  attribute: keyof Attributes;  // 'strength' | 'dexterity' | и т.д.
  value: number;                // +2, -1, etc.
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'ring' | 'amulet' | 'other';
  equipped: boolean;
  modifiers?: AttributeModifier[];
}