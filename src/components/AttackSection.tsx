import { useState } from 'react'
import type { Attack, NewAttack, Stats } from '../types/characters'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Textarea} from './ui/Textarea'
import { Select } from './ui/Select'

type Props = {
  attacks: Attack[]
  proficiencyBonus: number
  finalStats: Stats
  onAddAttack: (attack: NewAttack) => void
  onDeleteAttack: (attackId: string) => void
  onUpdateAttack: (attackId: string, attack: Partial<NewAttack>) => void
}

const createEmptyAttack = (): NewAttack => ({
  name: '',
  attackType: 'melee',
  ability: 'strength',
  proficient: true,
  damageDice: '1d6',
  damageBonus: 0,
  damageType: 'slashing',
  notes: '',
  source: 'manual',
})
const getModifier = (value: number) => Math.floor((value - 10) / 2)



type AttackFormProps = {
  value: NewAttack
  submitButtonClassName?: string
  onChange: (value: NewAttack) => void
  onSubmit: () => void
  onCancel?: () => void
  submitLabel: string
  title: string
  autoFocus?: boolean
  errors?: Partial<Record<'name' | 'damageDice' | 'damageType', string>>
}

function AttackForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  title,
  errors,

  
}: AttackFormProps) {
  return (
    <form
      className="bg-gray-800 rounded-lg p-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onCancel) {
          e.preventDefault()
          onCancel()
        }
      }}
    >
      <h3 className="text-white font-semibold">{title}</h3>

      <Input
        type="text"
        value={value.name}
        onChange={(e) =>
          onChange({
            ...value,
            name: e.target.value,
          })
        }
        placeholder="Название атаки"
        error={errors?.name}
      />
      

      <div className="grid grid-cols-2 gap-3">
        <Select
          value={value.attackType}
          onChange={(e) =>
            onChange({
              ...value,
              attackType: e.target.value as NewAttack['attackType'],
            })
          }
        >
          <option value="melee">Ближняя</option>
          <option value="ranged">Дальняя</option>
          <option value="spell">Заклинание</option>
        </Select>

        <Select
          value={value.ability}
          onChange={(e) =>
            onChange({
              ...value,
              ability: e.target.value as NewAttack['ability'],
            })
          }
        >
          <option value="strength">Сила</option>
          <option value="dexterity">Ловкость</option>
          <option value="constitution">Телосложение</option>
          <option value="intelligence">Интеллект</option>
          <option value="wisdom">Мудрость</option>
          <option value="charisma">Харизма</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="text"
          value={value.damageDice}
          onChange={(e) =>
            onChange({
              ...value,
              damageDice: e.target.value,
            })
          }
          placeholder="Урон, например 1d8"
          error={errors?.damageDice}
        />

        <Input
          type="number"
          value={value.damageBonus}
          onChange={(e) =>
            onChange({
              ...value,
              damageBonus: Number(e.target.value),
            })
          }
          placeholder="Бонус урона"
        />
      </div>

        <Input
          type="text"
          value={value.damageType}
          onChange={(e) =>
            onChange({
              ...value,
              damageType: e.target.value,
            })
          }
          placeholder="Тип урона"
          error={errors?.damageType}
        />

      <label className="flex items-center gap-2 text-white">
        <input
          type="checkbox"
          checked={value.proficient}
          onChange={(e) =>
            onChange({
              ...value,
              proficient: e.target.checked,
            })
          }
        />
        Владение оружием
      </label>

      <Textarea
        value={value.notes}
        onChange={(e) =>
          onChange({
            ...value,
            notes: e.target.value,
          })
        }
        placeholder="Заметки"
      />

      <div className="flex gap-2">
        <Button type="submit">
          {submitLabel}
        </Button>

        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Отмена
          </Button>
        )}
      </div>
    </form>
  )
}
const abilityLabels: Record<NewAttack['ability'], string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
}

export function AttackSection({
  attacks,
  proficiencyBonus,
  finalStats,
  onAddAttack,
  onDeleteAttack,
  onUpdateAttack,
}: Props) {
  const [createErrors, setCreateErrors] = useState<Partial<Record<'name' | 'damageDice' | 'damageType', string>>>({})
  const [editErrors, setEditErrors] = useState<Partial<Record<'name' | 'damageDice' | 'damageType', string>>>({})
  const [newAttack, setNewAttack] = useState<NewAttack>(createEmptyAttack())
  const [editingAttackId, setEditingAttackId] = useState<string | null>(null)
  const [editingAttack, setEditingAttack] = useState<NewAttack>(createEmptyAttack())

  const validateAttack = (attack: NewAttack) => {
  const errors: Partial<Record<'name' | 'damageDice' | 'damageType', string>> = {}

  if (!attack.name.trim()) {
    errors.name = 'Введите название атаки'
  }

  if (!attack.damageDice.trim()) {
    errors.damageDice = 'Укажите кость урона'
  }

  if (!attack.damageType.trim()) {
    errors.damageType = 'Укажите тип урона'
  }

  return errors
}

  const handleAddAttack = () => {
  const normalizedAttack: NewAttack = {
    ...newAttack,
    name: newAttack.name.trim(),
    damageDice: newAttack.damageDice.trim(),
    damageType: newAttack.damageType.trim(),
    notes: newAttack.notes.trim(),
  }

  const errors = validateAttack(normalizedAttack)

  if (Object.keys(errors).length > 0) {
    setCreateErrors(errors)
    return
  }

  setCreateErrors({})
  onAddAttack(normalizedAttack)
  setNewAttack(createEmptyAttack())
}

  const handleStartEdit = (attack: Attack) => {
    setEditingAttackId(attack.id)
    setEditingAttack({
      name: attack.name,
      attackType: attack.attackType,
      ability: attack.ability,
      proficient: attack.proficient,
      damageDice: attack.damageDice,
      damageBonus: attack.damageBonus,
      damageType: attack.damageType,
      notes: attack.notes,
      source: attack.source,
      itemId: attack.itemId,
    })
  }

  const handleSaveEdit = (attackId: string) => {
    const normalizedAttack: NewAttack = {
    ...editingAttack,
    name: editingAttack.name.trim(),
    damageDice: editingAttack.damageDice.trim(),
    damageType: editingAttack.damageType.trim(),
    notes: editingAttack.notes.trim(),
  }
    const errors = validateAttack(normalizedAttack)

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setEditErrors({})
    onUpdateAttack(attackId, normalizedAttack)
    setEditingAttackId(null)
    setEditingAttack(createEmptyAttack())
  }

  const handleCancelEdit = () => {
    setEditingAttackId(null)
    setEditingAttack(createEmptyAttack())
  }
  const handleNewAttackChangeFull = (value: NewAttack) => {
    setNewAttack(value)

    setCreateErrors(prev => ({
      ...prev,
      name: value.name ? undefined : prev.name,
      damageDice: value.damageDice ? undefined : prev.damageDice,
      damageType: value.damageType ? undefined : prev.damageType,
    }))
  }
  

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Атаки</h2>

      <AttackForm
  title="Добавить атаку"
  value={newAttack}
  onChange={handleNewAttackChangeFull}
  onSubmit={handleAddAttack}
  errors={createErrors}
  submitLabel="Добавить атаку"
/>
      {attacks.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
          Пока нет ни одной атаки.
        </div>
      )}

      <div className="space-y-3">
        {attacks.map((attack) => {
          const modifier = getModifier(finalStats[attack.ability])
          const attackBonus =
            modifier + (attack.proficient ? proficiencyBonus : 0)

          const damage =
            `${attack.damageDice}` +
            (attack.damageBonus !== 0
              ? ` ${attack.damageBonus > 0 ? '+' : '-'} ${Math.abs(attack.damageBonus)}`
              : '')

          if (editingAttackId === attack.id) {
            return (
              <AttackForm
                key={attack.id}
                title={`Редактирование: ${attack.name}`}
                value={editingAttack}
                onChange={setEditingAttack}
                onSubmit={() => handleSaveEdit(attack.id)}
                onCancel={handleCancelEdit}
                submitLabel="Сохранить"
                autoFocus={editingAttackId === attack.id}
                errors={editErrors}
                submitButtonClassName = 'bg-blue-600 hover:bg-blue-700'
              />
            )
          }

          return (
            <div
              key={attack.id}
              className="bg-gray-800 rounded-lg p-4 flex items-start justify-between border border-gray-700 hover:border-gray-500 transition"
            >
              <div>
                <div className="text-white font-bold text-lg">{attack.name}</div>

                <div className="text-xs text-gray-400 mt-1">
                  {attack.attackType === 'melee' && 'Ближняя атака'}
                  {attack.attackType === 'ranged' && 'Дальняя атака'}
                  {attack.attackType === 'spell' && 'Атака заклинанием'}
                  {' • '}
                  {abilityLabels[attack.ability]}
                </div>

                <div className="text-sm text-gray-300">
                  Урон: <span className="text-white">{damage}</span> ({attack.damageType})
                </div>

                {attack.source === 'item' && (
                  <div className="text-xs text-yellow-400 mt-1">От оружия</div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(attack)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-white"
                >
                  Изменить
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteAttack(attack.id)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
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