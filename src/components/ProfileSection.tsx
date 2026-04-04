import { useEffect, useRef, useState } from 'react'
import type { Character, Stats } from '../types/characters'

type Props = {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => void
}

const statLabels: Record<keyof Stats, string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
}

export function ProfileSection({ character, onUpdateCharacter }: Props) {
  const [isEditing, setIsEditing] = useState(false)


  const [form, setForm] = useState({
    name: character.name,
    race: character.race,
    class: character.class,
    level: character.level,
    alignment: character.alignment,
    background: character.background,
    description: character.description,
    avatarUrl: character.avatarUrl,
    baseStats: { ...character.baseStats },
  })
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
  if (isEditing) {
    nameInputRef.current?.focus()
  }
}, [isEditing])


  const handleStartEdit = () => {
    setForm({
      name: character.name,
      race: character.race,
      class: character.class,
      level: character.level,
      alignment: character.alignment,
      background: character.background,
      description: character.description,
      avatarUrl: character.avatarUrl,
      baseStats: { ...character.baseStats },
    })

    setIsEditing(true)
  }

  const handleSave = () => {
    const normalizedForm = {
      ...form,
      name: form.name.trim(),
      race: form.race.trim(),
      class: form.class.trim(),
      alignment: form.alignment.trim(),
      background: form.background.trim(),
      description: form.description.trim(),
      avatarUrl: form.avatarUrl.trim(),
    }

    onUpdateCharacter(normalizedForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      {isEditing ? (
        <div className="space-y-4">
          <input
            ref={nameInputRef}
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            placeholder="Имя персонажа"
            className="w-full bg-gray-700 text-white rounded p-2"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={form.race}
              onChange={(e) =>
                setForm({ ...form, race: e.target.value })
              }
              placeholder="Раса"
              className="bg-gray-700 text-white rounded p-2"
            />

            <input
              type="text"
              value={form.class}
              onChange={(e) =>
                setForm({ ...form, class: e.target.value })
              }
              placeholder="Класс"
              className="bg-gray-700 text-white rounded p-2"
            />

            <input
              type="number"
              value={form.level}
              onChange={(e) =>
                setForm({
                  ...form,
                  level: Math.max(1, Number(e.target.value)),
                })
              }
              placeholder="Уровень"
              className="bg-gray-700 text-white rounded p-2"
              min="1"
            />

            <input
              type="text"
              value={form.alignment}
              onChange={(e) =>
                setForm({ ...form, alignment: e.target.value })
              }
              placeholder="Мировоззрение"
              className="bg-gray-700 text-white rounded p-2"
            />

            <input
              type="text"
              value={form.background}
              onChange={(e) =>
                setForm({ ...form, background: e.target.value })
              }
              placeholder="Предыстория"
              className="bg-gray-700 text-white rounded p-2"
            />

            <input
              type="text"
              value={form.avatarUrl}
              onChange={(e) =>
                setForm({ ...form, avatarUrl: e.target.value })
              }
              placeholder="Ссылка на аватар"
              className="bg-gray-700 text-white rounded p-2"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Описание персонажа"
            className="w-full bg-gray-700 text-white rounded p-2"
            rows={4}
          />

          <div>
            <div className="text-white font-semibold mb-2">
              Базовые характеристики
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.entries(form.baseStats) as [keyof Stats, number][]).map(
                ([key, value]) => (
                  <div key={key}>
                    <label className="block text-gray-400 text-sm mb-1">
                      {statLabels[key]}
                    </label>

                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          baseStats: {
                            ...form.baseStats,
                            [key]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full bg-gray-700 text-white rounded p-2"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Сохранить
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {character.name || 'Новый персонаж'}
              </h1>

              <div className="text-gray-300 mt-2">
                {character.race || 'Без расы'} • {character.class || 'Без класса'} уровень {character.level}
              </div>

              {(character.alignment || character.background) && (
                <div className="text-gray-400 mt-2 text-sm">
                  {[character.alignment, character.background]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartEdit}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
            >
              Редактировать
            </button>
          </div>

          {character.avatarUrl && (
            <img
              src={character.avatarUrl}
              alt={`${character.name} avatar`}
              className="mt-4 w-32 h-32 object-cover rounded-lg border border-gray-700"
            />
          )}

          {character.description && (
            <p className="text-gray-300 mt-4 whitespace-pre-line">
              {character.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}