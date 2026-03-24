import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import type { Character } from '../types/characters';

interface CharacterFormProps {
  character?: Character | null;
  onClose: () => void;
}

export function CharacterForm({ character, onClose }: CharacterFormProps) {
  const { addCharacter, updateCharacter } = useCharacterStore();
  const [formData, setFormData] = useState({
    id: character?.id || crypto.randomUUID(),
    name: character?.name || '',
    level: character?.level || 1,
    class: character?.class || 'Воин',
    race: character?.race || 'Человек',
    attributes: character?.attributes || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (character) {
      updateCharacter(character.id, formData);
    } else {
      addCharacter(formData as Character);
    }
    onClose();
  };

  const updateAttribute = (attr: string, value: number) => {
    setFormData({
      ...formData,
      attributes: { ...formData.attributes, [attr]: value }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Имя персонажа</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-yellow-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Уровень</label>
          <input
            type="number"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
            min="1"
            max="20"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Класс</label>
          <select
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
          >
            <option>Воин</option>
            <option>Маг</option>
            <option>Плут</option>
            <option>Жрец</option>
            <option>Следопыт</option>
            <option>Паладин</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Раса</label>
          <select
            value={formData.race}
            onChange={(e) => setFormData({ ...formData, race: e.target.value })}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
          >
            <option>Человек</option>
            <option>Эльф</option>
            <option>Гном</option>
            <option>Полурослик</option>
            <option>Дварф</option>
            <option>Тифлинг</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Характеристики</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(formData.attributes).map(([key, value]) => {
            const labels: Record<string, string> = {
              strength: '💪 Сила', dexterity: '🏃 Ловкость', constitution: '🛡️ Телосложение',
              intelligence: '📚 Интеллект', wisdom: '🕯️ Мудрость', charisma: '🗣️ Харизма'
            };
            return (
              <div key={key} className="bg-gray-800 rounded-lg p-2">
                <label className="text-gray-400 text-sm block mb-1">{labels[key]}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateAttribute(key, parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded p-1 text-center"
                  min="1"
                  max="20"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold transition"
        >
          {character ? 'Сохранить изменения' : 'Создать персонажа'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}