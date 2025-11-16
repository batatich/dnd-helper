import type { Character } from '../types/characters';

export const sampleCharacters: Character[] = [
  {
    id: "1",
    name: "Арагорн",
    level: 5,
    race: "Человек",
    class: "Воин",
    attributes: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 13
    },
    equipment: ["1", "2", "3"] // ID предметов из sample-equipment
  },
  {
    id: "2",
    name: "Гэндальф",
    level: 10,
    race: "Маг",
    class: "Волшебник",
    attributes: {
      strength: 9,
      dexterity: 12,
      constitution: 11,
      intelligence: 18,
      wisdom: 16,
      charisma: 15
    },
    equipment: ["4", "5"] // ID предметов из sample-equipment
  }
];
