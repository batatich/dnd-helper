import type { Skill } from '../types/characters';

export const standardSkills: Skill[] = [
  // Сила
  { name: 'Атлетика', attribute: 'strength', proficient: false },
  // Ловкость
  { name: 'Акробатика', attribute: 'dexterity', proficient: false },
  { name: 'Ловкость рук', attribute: 'dexterity', proficient: false },
  { name: 'Скрытность', attribute: 'dexterity', proficient: false },
  // Интеллект
  { name: 'Магия', attribute: 'intelligence', proficient: false },
  { name: 'История', attribute: 'intelligence', proficient: false },
  { name: 'Расследование', attribute: 'intelligence', proficient: false },
  { name: 'Природа', attribute: 'intelligence', proficient: false },
  { name: 'Религия', attribute: 'intelligence', proficient: false },
  // Мудрость
  { name: 'Уход за животными', attribute: 'wisdom', proficient: false },
  { name: 'Проницательность', attribute: 'wisdom', proficient: false },
  { name: 'Медицина', attribute: 'wisdom', proficient: false },
  { name: 'Восприятие', attribute: 'wisdom', proficient: false },
  { name: 'Выживание', attribute: 'wisdom', proficient: false },
  // Харизма
  { name: 'Обман', attribute: 'charisma', proficient: false },
  { name: 'Запугивание', attribute: 'charisma', proficient: false },
  { name: 'Выступление', attribute: 'charisma', proficient: false },
  { name: 'Убеждение', attribute: 'charisma', proficient: false }
];