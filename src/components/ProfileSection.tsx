import { useState } from 'react'
import type { Character, Stats } from '../types/characters'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Textarea} from './ui/Textarea'


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
    <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700 shadow-sm">
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            placeholder="Имя персонажа"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              value={form.race}
              onChange={(e) =>
                setForm({ ...form, race: e.target.value })
              }
              placeholder="Раса"
            />

            <Input
              value={form.class}
              onChange={(e) =>
                setForm({ ...form, class: e.target.value })
              }
              placeholder="Класс"
            />

            <Input
              type="number"
              value={form.level}
              onChange={(e) =>
                setForm({
                  ...form,
                  level: Math.max(1, Number(e.target.value)),
                })
              }
              placeholder="Уровень"
            />

            <Input
              type="text"
              value={form.alignment}
              onChange={(e) =>
                setForm({ ...form, alignment: e.target.value })
              }
              placeholder="Мировоззрение"
            />

            <Input
              type="text"
              value={form.background}
              onChange={(e) =>
                setForm({ ...form, background: e.target.value })
              }
              placeholder="Предыстория"
            />

            <Input
              type="text"
              value={form.avatarUrl}
              onChange={(e) =>
                setForm({ ...form, avatarUrl: e.target.value })
              }
              placeholder="Ссылка на аватар"
            />
          </div>

          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Описание персонажа"
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

                    <Input
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
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleSave}>
              Сохранить
            </Button>

            <Button type="button" onClick={handleCancel} variant="secondary">
              Отмена
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">
                {character.name || 'Новый персонаж'}
              </h1>

              <div className="text-gray-300 mt-2">
                <span>{character.race || 'Без расы'}</span>
                {' • '}
                <span>{character.class || 'Без класса'}</span>
                {' • '}
                <span>Уровень {character.level}</span>
              </div>

              {(character.alignment || character.background) && (
                <div className="text-gray-400 mt-2 text-sm">
                  {[character.alignment, character.background]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              )}
            </div>

            <Button type="button" onClick={handleStartEdit}>
              Редактировать
            </Button>
          </div>

          {character.avatarUrl && (
            <img
              src={character.avatarUrl}
              alt={`${character.name} avatar`}
              className="mt-4 w-32 h-32 object-cover rounded-xl border border-gray-700 shadow-md"
            />
          )}

          {character.description && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {character.description}
              </p>
            </div>
          )}
        </div>
      )
    }
  </div>
  )
}
