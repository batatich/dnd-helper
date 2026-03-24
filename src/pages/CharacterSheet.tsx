import { useState } from 'react';
import { getModifier } from '../types/characters';
import { sampleCharacters } from '../data/sample-characters';

export function CharacterSheet() {
  const [character] = useState(sampleCharacters[0]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Имя персонажа */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-white">{character.name}</h1>
        <div className="text-gray-300 mt-2">
          {character.race} • {character.class} уровень {character.level}
        </div>
      </div>

      {/* Характеристики */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(character.attributes).map(([key, value]) => {
          const labels: Record<string, string> = {
            strength: 'СИЛА', dexterity: 'ЛОВКОСТЬ', constitution: 'ТЕЛОСЛОЖЕНИЕ',
            intelligence: 'ИНТЕЛЛЕКТ', wisdom: 'МУДРОСТЬ', charisma: 'ХАРИЗМА'
          };
          const mod = getModifier(value);
          return (
            <div key={key} className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm">{labels[key]}</div>
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className={`text-lg ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {mod >= 0 ? `+${mod}` : mod}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}