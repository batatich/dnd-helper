import { useState } from 'react'
import { useCharacterStore } from '../stores/characterStore'
import type { Character, Stats } from '../types/characters'
import { calculateStartingDerivedStats } from '../utils/createCharacter'
import { standardSkills } from '../data/skills'

interface CharacterFormProps {
  character?: Character | null
  onClose: () => void
}

type CharacterFormData = {
  id: string
  name: string
  level: number
  class: string
  race: string
  baseStats: Stats
  description: string
  alignment: string
  background: string
  avatarUrl: string
}

const defaultBaseStats: Stats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

const defaultEquippedItems = {
  mainHand: null,
  offHand: null,
  head: null,
  body: null,
  ring1: null,
  ring2: null,
  amulet: null,
  boots: null,
}

export function CharacterForm({ character, onClose }: CharacterFormProps) {
  const { addCharacter, updateCharacter } = useCharacterStore()

  const [formData, setFormData] = useState<CharacterFormData>({
    id: character?.id || crypto.randomUUID(),
    name: character?.name || '',
    level: character?.level || 1,
    class: character?.class || 'Воин',
    race: character?.race || 'Человек',
    baseStats: character?.baseStats || defaultBaseStats,
    description: character?.description || '',
    alignment: character?.alignment || '',
    background: character?.background || '',
    avatarUrl: character?.avatarUrl || '',
  })
  const startingDerivedStats = calculateStartingDerivedStats(formData.baseStats)
  const previewDerivedStats = calculateStartingDerivedStats(formData.baseStats)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (character) {
      updateCharacter(character.id, {
        name: formData.name,
        level: formData.level,
        class: formData.class,
        race: formData.race,
        baseStats: formData.baseStats,
        description: formData.description,
        alignment: formData.alignment,
        background: formData.background,
        avatarUrl: formData.avatarUrl,
      })
    } else {
      const newCharacter: Character = {
        id: formData.id,
        name: formData.name,
        level: formData.level,
        class: formData.class,
        race: formData.race,
        baseStats: formData.baseStats,
        description: formData.description,
        alignment: formData.alignment,
        background: formData.background,
        avatarUrl: formData.avatarUrl,
        skills: standardSkills,
        derivedStats: startingDerivedStats, 
        currentHp: startingDerivedStats.maxHp,
        temporaryHp: 0,
        inventory: [],
        equippedItems: defaultEquippedItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        savingThrowProficiencies: [],
        deathSaves: {
        successes: 0,
        failures: 0,
        },
        attacks: [],
        inspiration: false,
        speed: 30,
        hitDice: {
          total: 1,
          used: 0,
          dice: '1d8',
        },

      }

      addCharacter(newCharacter)
    }

    onClose()
  }

  const updateStat = (stat: keyof Stats, value: number) => {
    setFormData({
      ...formData,
      baseStats: {
        ...formData.baseStats,
        [stat]: value,
      },
    })
  }

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
          <label className="block text-gray-400 text-sm mb-1">Биография</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Мировоззрение</label>
          <input
            type="text"
            value={formData.alignment}
            onChange={(e) =>
              setFormData({ ...formData, alignment: e.target.value })
            }
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
            placeholder="Например: Lawful Good"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Предыстория</label>
          <input
            type="text"
            value={formData.background}
            onChange={(e) =>
              setFormData({ ...formData, background: e.target.value })
            }
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Ссылка на портрет</label>
          <input
            type="text"
            value={formData.avatarUrl}
            onChange={(e) =>
              setFormData({ ...formData, avatarUrl: e.target.value })
            }
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
            placeholder="https://..."
          />
        </div>


        <div>
          <label className="block text-gray-400 text-sm mb-1">Уровень</label>
          <input
            type="number"
            value={formData.level}
            onChange={(e) =>
              setFormData({
                ...formData,
                level: Number(e.target.value),
              })
            }
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
          {(Object.entries(formData.baseStats) as [keyof Stats, number][]).map(
            ([key, value]) => {
              const labels: Record<keyof Stats, string> = {
                strength: '💪 Сила',
                dexterity: '🏃 Ловкость',
                constitution: '🛡️ Телосложение',
                intelligence: '📚 Интеллект',
                wisdom: '🕯️ Мудрость',
                charisma: '🗣️ Харизма',
              }

              return (
                <div key={key} className="bg-gray-800 rounded-lg p-2">
                  <label className="text-gray-400 text-sm block mb-1">
                    {labels[key]}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateStat(key, Number(e.target.value))}
                    className="w-full bg-gray-700 text-white rounded p-1 text-center"
                    min="1"
                    max="20"
                  />
                </div>
              )
            }
          )}
        </div>
      </div>
      <div>

      <h3 className="text-white font-semibold mb-3">Стартовые параметры</h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-sm">HP</div>
          <div className="text-white font-bold text-lg">
            {previewDerivedStats.maxHp}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-sm">Класс брони</div>
          <div className="text-white font-bold text-lg">
            {previewDerivedStats.armorClass}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-sm">Инициатива</div>
          <div className="text-white font-bold text-lg">
            {previewDerivedStats.initiative}
          </div>
        </div>
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
  )
}