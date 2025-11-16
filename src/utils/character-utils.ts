import type { Character, Equipment } from '../types/characters';

// Получить полные данные экипировки персонажа
export function getCharacterEquipment(
  character: Character, 
  allEquipment: Equipment[]
): Equipment[] {
  return allEquipment.filter(item => 
    character.equipment.includes(item.id)
  );
}

// Получить экипированные предметы
export function getEquippedItems(
  character: Character,
  allEquipment: Equipment[]
): Equipment[] {
  const characterEquipment = getCharacterEquipment(character, allEquipment);
  return characterEquipment.filter(item => item.equipped);
}

// Рассчитать итоговые характеристики с учетом экипировки
export function calculateTotalAttributes(
  character: Character,
  allEquipment: Equipment[]
) {
  const baseAttributes = { ...character.attributes };
  const equippedItems = getEquippedItems(character, allEquipment);
  
  // Применяем модификаторы от экипировки
  equippedItems.forEach(item => {
    item.modifiers?.forEach(modifier => {
      baseAttributes[modifier.attribute] += modifier.value;
    });
  });
  
  return baseAttributes;
}