import { useState } from 'react'
import type { NewSpell, Spell, SpellSlot, Stats } from '../types/characters'

type Props = {
  characterId: string
  spells: Spell[]
  spellSlots: SpellSlot[]
  spellcastingAbility: keyof Stats
  spellSaveDc: number
  spellAttackBonus: number
  onAddSpell: (spell: NewSpell) => void
  onDeleteSpell: (spellId: string) => void
  onUpdateSpell: (spellId: string, spell: Partial<NewSpell>) => void
  onSetSpellcastingAbility: (ability: keyof Stats) => void
  onSetSpellSlotsTotal: (level: number, total: number) => void
  onChangeSpellSlot: (level: number, delta: number) => void
}
const createEmptySpell = (): NewSpell => ({
  name: '',
  level: 0,
  school: '',
  castingTime: '',
  range: '',
  duration: '',
  components: '',
  concentration: false,
  ritual: false,
  description: '',
})
type SpellFormProps = {
  value: NewSpell
  onChange: (value: NewSpell) => void
  onSubmit: () => void
  onCancel?: () => void
  submitLabel: string
  title: string
}

function SpellForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  title,
}: SpellFormProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h3 className="text-white font-semibold">{title}</h3>

      <input
        type="text"
        value={value.name}
        onChange={(e) =>
          onChange({
            ...value,
            name: e.target.value,
          })
        }
        placeholder="Название заклинания"
        className="bg-gray-700 text-white rounded p-2 w-full"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          value={value.level}
          onChange={(e) =>
            onChange({
              ...value,
              level: Number(e.target.value),
            })
          }
          placeholder="Уровень"
          className="bg-gray-700 text-white rounded p-2 w-full"
        />

        <input
          type="text"
          value={value.school}
          onChange={(e) =>
            onChange({
              ...value,
              school: e.target.value,
            })
          }
          placeholder="Школа"
          className="bg-gray-700 text-white rounded p-2 w-full"
        />
      </div>

      <input
        type="text"
        value={value.castingTime}
        onChange={(e) =>
          onChange({
            ...value,
            castingTime: e.target.value,
          })
        }
        placeholder="Время накладывания"
        className="bg-gray-700 text-white rounded p-2 w-full"
      />

      <input
        type="text"
        value={value.range}
        onChange={(e) =>
          onChange({
            ...value,
            range: e.target.value,
          })
        }
        placeholder="Дистанция"
        className="bg-gray-700 text-white rounded p-2 w-full"
      />

      <input
        type="text"
        value={value.duration}
        onChange={(e) =>
          onChange({
            ...value,
            duration: e.target.value,
          })
        }
        placeholder="Длительность"
        className="bg-gray-700 text-white rounded p-2 w-full"
      />

      <textarea
        value={value.description}
        onChange={(e) =>
          onChange({
            ...value,
            description: e.target.value,
          })
        }
        placeholder="Описание"
        className="bg-gray-700 text-white rounded p-2 w-full min-h-[100px]"
      />


      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          {submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
          >
            Отмена
          </button>
        )}
      </div>
    </div>
  )
}
export function SpellSection({
  spells,
  spellSlots,
  spellcastingAbility,
  spellSaveDc,
  spellAttackBonus,
  onAddSpell,
  onDeleteSpell,
  onUpdateSpell,
  onSetSpellcastingAbility,
  onSetSpellSlotsTotal,
  onChangeSpellSlot,
}: Props) {
  const [newSpell, setNewSpell] = useState<NewSpell>(createEmptySpell())
  const [editingSpellId, setEditingSpellId] = useState<string | null>(null)
  const [editingSpell, setEditingSpell] = useState<NewSpell>(createEmptySpell())
    const handleAddSpell = () => {
    const normalizedSpell: NewSpell = {
      ...newSpell,
      name: newSpell.name.trim(),
      school: newSpell.school.trim(),
      castingTime: newSpell.castingTime.trim(),
      range: newSpell.range.trim(),
      duration: newSpell.duration.trim(),
      description: newSpell.description.trim(),
    }

    if (!normalizedSpell.name) return

    onAddSpell(normalizedSpell)
    setNewSpell(createEmptySpell())
  }

  const handleStartEdit = (spell: Spell) => {
    setEditingSpellId(spell.id)
    setEditingSpell({
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime,
        range: spell.range,
        duration: spell.duration,
        components: spell.components,
        concentration: spell.concentration,
        ritual: spell.ritual,
        description: spell.description,
    })
  }

  const handleSaveEdit = (spellId: string) => {
    const normalizedSpell: NewSpell = {
      ...editingSpell,
      name: editingSpell.name.trim(),
      school: editingSpell.school.trim(),
      castingTime: editingSpell.castingTime.trim(),
      range: editingSpell.range.trim(),
      duration: editingSpell.duration.trim(),
      description: editingSpell.description.trim(),
    }

    if (!normalizedSpell.name) return

    onUpdateSpell(spellId, normalizedSpell)
    setEditingSpellId(null)
    setEditingSpell(createEmptySpell())
  }

  const handleCancelEdit = () => {
    setEditingSpellId(null)
    setEditingSpell(createEmptySpell())
  }

    return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Заклинания</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
    <div>
      <label className="block text-gray-400 text-sm mb-2">
        Характеристика заклинателя
      </label>

      <select
        value={spellcastingAbility}
        onChange={(e) =>
          onSetSpellcastingAbility(e.target.value as keyof Stats)
        }
        className="w-full bg-gray-700 text-white rounded p-2"
      >
        <option value="strength">Сила</option>
        <option value="dexterity">Ловкость</option>
        <option value="constitution">Телосложение</option>
        <option value="intelligence">Интеллект</option>
        <option value="wisdom">Мудрость</option>
        <option value="charisma">Харизма</option>
      </select>
    </div>

    <div className="bg-gray-700 rounded p-3 text-center">
      <div className="text-gray-400 text-sm">Сл спасброска</div>
      <div className="text-white text-xl font-bold">{spellSaveDc}</div>
    </div>

    <div className="bg-gray-700 rounded p-3 text-center">
      <div className="text-gray-400 text-sm">Бонус атаки заклинанием</div>
      <div className="text-white text-xl font-bold">
        {spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus}
      </div>
    </div>
  </div>
</div>

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
  <h3 className="text-white font-semibold mb-3">Ячейки заклинаний</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {spellSlots.map((slot) => (
      <div
        key={slot.level}
        className="bg-gray-700 rounded p-3 flex flex-col gap-2"
      >
        <div className="text-white font-semibold">
          Уровень {slot.level}
        </div>

        <input
          type="number"
          value={slot.total}
          onChange={(e) =>
            onSetSpellSlotsTotal(slot.level, Number(e.target.value))
          }
          className="bg-gray-600 text-white rounded p-1"
          placeholder="Всего"
          min="0"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onChangeSpellSlot(slot.level, -1)}
            className="bg-gray-600 px-2 rounded text-white"
          >
            -
          </button>

          <div className="text-white">
            {slot.used} / {slot.total}
          </div>

          <button
            type="button"
            onClick={() => onChangeSpellSlot(slot.level, 1)}
            className="bg-gray-600 px-2 rounded text-white"
          >
            +
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

      <SpellForm
        title="Добавить заклинание"
        value={newSpell}
        onChange={setNewSpell}
        onSubmit={handleAddSpell}
        submitLabel="Добавить заклинание"
      />

      {spells.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
          Пока нет ни одного заклинания.
        </div>
      )}

      <div className="space-y-3">
        {spells.map((spell) => {
          if (editingSpellId === spell.id) {
            return (
              <SpellForm
                key={spell.id}
                title={`Редактирование: ${spell.name}`}
                value={editingSpell}
                onChange={setEditingSpell}
                onSubmit={() => handleSaveEdit(spell.id)}
                onCancel={handleCancelEdit}
                submitLabel="Сохранить"
              />
            )
          }

          return (
            <div
              key={spell.id}
              className="bg-gray-800 rounded-lg p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="text-white font-semibold">{spell.name}</div>
                <div className="text-sm text-gray-300">
                  Уровень: {spell.level} • Школа: {spell.school}
                </div>
                <div className="text-xs text-gray-400">
                  Время: {spell.castingTime} • Дистанция: {spell.range}
                </div>
                <div className="text-xs text-gray-400">
                  Длительность: {spell.duration}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(spell)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white"
                >
                  Изменить
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSpell(spell.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
                >
                  Удалить
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}