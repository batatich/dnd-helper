import { useState } from 'react'
import type { Character, Stats } from '../types/characters'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'

type Props = {
  character: Character

  // Обычное обновление профиля персонажа:
  // имя, раса, класс, уровень, описание и т.д.
  onUpdateCharacter: (updates: Partial<Character>) => void | Promise<void>

  // Отдельное обновление базовых характеристик.
  // Это должно уходить на PATCH /characters/:id/stats
  onUpdateStats?: (stats: Stats) => void | Promise<void>

  isLoading?: boolean
}

const statLabels: Record<keyof Stats, string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
}

function clampLevel(value: number) {
  if (Number.isNaN(value)) return 1

  return Math.min(20, Math.max(1, value))
}

function clampAbilityScore(value: number) {
  if (Number.isNaN(value)) return 1

  return Math.min(30, Math.max(1, value))
}

function getCharacterStats(character: Character): Stats {
  const characterWithMaybeStats = character as Character & {
    stats?: Stats | null
  }

  const stats = characterWithMaybeStats.stats

  return {
    strength: Number(stats?.strength ?? 10),
    dexterity: Number(stats?.dexterity ?? 10),
    constitution: Number(stats?.constitution ?? 10),
    intelligence: Number(stats?.intelligence ?? 10),
    wisdom: Number(stats?.wisdom ?? 10),
    charisma: Number(stats?.charisma ?? 10),
  }
}

function createFormFromCharacter(character: Character) {
  return {
    name: character.name ?? '',
    race: character.race ?? '',
    className: character.className ?? '',
    level: character.level ?? 1,
    alignment: character.alignment ?? '',
    background: character.background ?? '',
    description: character.description ?? '',
    avatarUrl: character.avatarUrl ?? '',
    baseStats: getCharacterStats(character),
  }
}

export function ProfileSection({
  character,
  onUpdateCharacter,
  onUpdateStats,
  isLoading = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState(() => createFormFromCharacter(character))

  const handleStartEdit = () => {
    setForm(createFormFromCharacter(character))
    setIsEditing(true)
  }

  const handleSave = async () => {
    const normalizedForm = {
      name: (form.name ?? '').trim(),
      race: (form.race ?? '').trim(),
      className: (form.className ?? '').trim(),
      level: clampLevel(Number(form.level)),
      alignment: (form.alignment ?? '').trim(),
      background: (form.background ?? '').trim(),
      description: (form.description ?? '').trim(),
      avatarUrl: (form.avatarUrl ?? '').trim(),
    }

    await onUpdateCharacter(normalizedForm)

    if (onUpdateStats) {
      await onUpdateStats(form.baseStats)
    }

    setIsEditing(false)
  }

  const handleCancel = () => {
    setForm(createFormFromCharacter(character))
    setIsEditing(false)
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700 shadow-sm">
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Имя персонажа"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              value={form.race}
              onChange={(e) => setForm({ ...form, race: e.target.value })}
              placeholder="Раса"
            />

            <Input
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              placeholder="Класс"
            />

            <Input
              type="number"
              min={1}
              max={20}
              value={form.level}
              onChange={(e) =>
                setForm({
                  ...form,
                  level: clampLevel(Number(e.target.value)),
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
                      min={1}
                      max={30}
                      value={value}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          baseStats: {
                            ...form.baseStats,
                            [key]: clampAbilityScore(
                              Number(e.target.value),
                            ),
                          },
                        })
                      }
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={isLoading}
            >
              Сохранить
            </Button>

            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              disabled={isLoading}
            >
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
                <span>{character.className || 'Без класса'}</span>
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
      )}
    </div>
  )
}