import { useState, type FormEvent } from 'react'
import { useCharacterStore } from '../stores/characterStore'
import type { Character, Stats } from '../types/characters'
import { calculateStartingDerivedStats } from '../utils/createCharacter'

interface CharacterFormProps {
  character?: Character | null
  onClose: () => void
}

type CharacterFormData = {
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

type AbilityRollResult = {
  dice: number[]
  dropped: number
  total: number
}

type AbilityRolls = Record<keyof Stats, AbilityRollResult>

const defaultBaseStats: Stats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

const statLabels: Record<keyof Stats, string> = {
  strength: '💪 Сила',
  dexterity: '🏃 Ловкость',
  constitution: '🛡️ Телосложение',
  intelligence: '📚 Интеллект',
  wisdom: '🕯️ Мудрость',
  charisma: '🗣️ Харизма',
}

const statKeys = Object.keys(defaultBaseStats) as (keyof Stats)[]

function getCharacterStats(character?: Character | null): Stats {
  const characterWithMaybeStats = character as Character & {
    stats?: Stats | null
  }

  const stats = character?.baseStats ?? characterWithMaybeStats?.stats

  return {
    strength: Number(stats?.strength ?? 10),
    dexterity: Number(stats?.dexterity ?? 10),
    constitution: Number(stats?.constitution ?? 10),
    intelligence: Number(stats?.intelligence ?? 10),
    wisdom: Number(stats?.wisdom ?? 10),
    charisma: Number(stats?.charisma ?? 10),
  }
}

function clampLevel(value: number) {
  if (Number.isNaN(value)) return 1

  return Math.min(20, Math.max(1, value))
}

function clampAbilityScore(value: number) {
  if (Number.isNaN(value)) return 1

  return Math.min(30, Math.max(1, value))
}

function getModifier(stat: number) {
  return Math.floor((stat - 10) / 2)
}

function formatModifier(modifier: number) {
  return modifier >= 0 ? `+${modifier}` : String(modifier)
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1
}

function rollAbilityScore(): AbilityRollResult {
  const dice = [rollD6(), rollD6(), rollD6(), rollD6()]
  const dropped = Math.min(...dice)
  const total = dice.reduce((sum, value) => sum + value, 0) - dropped

  return {
    dice,
    dropped,
    total,
  }
}

function rollAbilityScores() {
  const stats = {} as Stats
  const rolls = {} as AbilityRolls

  for (const stat of statKeys) {
    const result = rollAbilityScore()

    stats[stat] = result.total
    rolls[stat] = result
  }

  return {
    stats,
    rolls,
  }
}

export function CharacterForm({ character, onClose }: CharacterFormProps) {
  const {
    addCharacter,
    updateCharacter,
    updateCharacterStats,
    rollCharacterStats,
    isLoading,
  } = useCharacterStore()

  const [rolls, setRolls] = useState<AbilityRolls | null>(null)

  const [formData, setFormData] = useState<CharacterFormData>({
    name: character?.name || '',
    level: character?.level || 1,
    class: character?.class || 'Воин',
    race: character?.race || 'Человек',
    baseStats: getCharacterStats(character),
    description: character?.description || '',
    alignment: character?.alignment || '',
    background: character?.background || '',
    avatarUrl: character?.avatarUrl || '',
  })

  const previewDerivedStats = calculateStartingDerivedStats(formData.baseStats)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const normalizedData = {
      name: formData.name.trim(),
      level: clampLevel(formData.level),
      class: formData.class,
      race: formData.race,
      baseStats: formData.baseStats,
      description: formData.description.trim(),
      alignment: formData.alignment.trim(),
      background: formData.background.trim(),
      avatarUrl: formData.avatarUrl.trim(),
    }

    if (character) {
      await updateCharacter(character.id, {
        name: normalizedData.name,
        level: normalizedData.level,
        class: normalizedData.class,
        race: normalizedData.race,
        description: normalizedData.description,
        alignment: normalizedData.alignment,
        background: normalizedData.background,
        avatarUrl: normalizedData.avatarUrl,
      })

      await updateCharacterStats(character.id, normalizedData.baseStats)
    } else {
      await addCharacter({
        name: normalizedData.name,
        level: normalizedData.level,
        class: normalizedData.class,
        race: normalizedData.race,
        baseStats: normalizedData.baseStats,
        description: normalizedData.description,
        alignment: normalizedData.alignment,
        background: normalizedData.background,
        avatarUrl: normalizedData.avatarUrl,
      } as Character)
    }

    onClose()
  }

  const updateStat = (stat: keyof Stats, value: number) => {
    setRolls(null)

    setFormData({
      ...formData,
      baseStats: {
        ...formData.baseStats,
        [stat]: clampAbilityScore(value),
      },
    })
  }

  const handleRollStats = async () => {
    if (character) {
      const result = await rollCharacterStats(character.id)

      if (!result) return

      setFormData({
        ...formData,
        baseStats: result.stats,
      })

      setRolls(result.rolls)

      return
    }

    const result = rollAbilityScores()

    setFormData({
      ...formData,
      baseStats: result.stats,
    })

    setRolls(result.rolls)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">
            Имя персонажа
          </label>
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
          <label className="block text-gray-400 text-sm mb-1">
            Мировоззрение
          </label>
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
          <label className="block text-gray-400 text-sm mb-1">
            Предыстория
          </label>
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
          <label className="block text-gray-400 text-sm mb-1">
            Ссылка на портрет
          </label>
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
                level: clampLevel(Number(e.target.value)),
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
            onChange={(e) =>
              setFormData({ ...formData, class: e.target.value })
            }
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
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-white font-semibold">Характеристики</h3>
            <p className="text-gray-500 text-sm">
              Можно ввести вручную или сгенерировать через 4d6 с отбрасыванием
              меньшего кубика.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRollStats()}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-lg transition text-white"
          >
            🎲 Сгенерировать 4d6
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.entries(formData.baseStats) as [keyof Stats, number][]).map(
            ([key, value]) => {
              const modifier = getModifier(value)
              const roll = rolls?.[key]

              return (
                <div key={key} className="bg-gray-800 rounded-lg p-2">
                  <label className="text-gray-400 text-sm block mb-1">
                    {statLabels[key]}
                  </label>

                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateStat(key, Number(e.target.value))}
                    className="w-full bg-gray-700 text-white rounded p-1 text-center"
                    min="1"
                    max="30"
                  />

                  <div className="text-gray-500 text-xs mt-1 text-center">
                    Мод: {formatModifier(modifier)}
                  </div>

                  {roll && (
                    <div className="text-gray-500 text-xs mt-1 text-center">
                      {roll.dice.join(', ')} | убрать {roll.dropped} | итог{' '}
                      {roll.total}
                    </div>
                  )}
                </div>
              )
            },
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
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 rounded-lg font-semibold transition"
        >
          {isLoading
            ? 'Сохранение...'
            : character
              ? 'Сохранить изменения'
              : 'Создать персонажа'}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-lg transition"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}