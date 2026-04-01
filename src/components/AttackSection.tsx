import { useState } from 'react'
import type { Attack, Stats } from '../types/characters'

type Props = {
  characterId: string
  attacks: Attack[]
  proficiencyBonus: number
  finalStats: Stats
  addAttack: (characterId: string, attack: Omit<Attack, 'id'>) => void
  deleteAttack: (characterId: string, attackId: string) => void
  updateAttack: (
    characterId: string,
    attackId: string,
    attack: Partial<Attack>
  ) => void
}

const getModifier = (value: number) => Math.floor((value - 10) / 2)

export function AttackSection({
  characterId,
  attacks,
  proficiencyBonus,
  finalStats,
  addAttack,
  deleteAttack,
  updateAttack,
}: Props) {
  const [newAttack, setNewAttack] = useState<Omit<Attack, 'id'>>({
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

  const [editingAttackId, setEditingAttackId] = useState<string | null>(null)
  const [editingAttack, setEditingAttack] = useState<Omit<Attack, 'id'>>({
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

  const handleAddAttack = () => {
    if (!newAttack.name.trim()) return

    addAttack(characterId, newAttack)

    setNewAttack({
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
  }

  const handleStartEdit = (attack: Attack) => {
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
    updateAttack(characterId, attackId, editingAttack)
    setEditingAttackId(null)
  }

  const handleCancelEdit = () => {
    setEditingAttackId(null)
  }

  return (
    <div>
      <h2 className="text-white text-xl font-bold mt-8 mb-4">Атаки</h2>

      {/* Создание */}
      <div className="bg-gray-800 p-4 rounded mb-4 space-y-2">
        <input
          type="text"
          value={newAttack.name}
          onChange={(e) =>
            setNewAttack({ ...newAttack, name: e.target.value })
          }
          placeholder="Название атаки"
          className="bg-gray-700 text-white rounded p-2 w-full"
        />

        <button
          onClick={handleAddAttack}
          className="bg-blue-600 px-3 py-1 rounded"
        >
          Добавить атаку
        </button>
      </div>

      {/* Список */}
      <div className="space-y-3">
        {attacks.map((attack) => {
          const modifier = getModifier(finalStats[attack.ability])
          const attackBonus =
            modifier + (attack.proficient ? proficiencyBonus : 0)
          const damage =
            `${attack.damageDice}` +
            (attack.damageBonus ? ` + ${attack.damageBonus}` : '')

          if (editingAttackId === attack.id) {
            return (
              <div key={attack.id} className="bg-gray-800 p-4 rounded space-y-2">
                <input
                  value={editingAttack.name}
                  onChange={(e) =>
                    setEditingAttack({
                      ...editingAttack,
                      name: e.target.value,
                    })
                  }
                  className="bg-gray-700 text-white rounded p-2 w-full"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(attack.id)}
                    className="bg-green-600 px-3 py-1 rounded"
                  >
                    Сохранить
                  </button>

                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 px-3 py-1 rounded"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={attack.id} className="bg-gray-800 p-4 rounded">
              <div className="flex justify-between">
                <div>
                  <div className="text-white font-semibold">
                    {attack.name}
                  </div>

                  <div className="text-gray-400 text-sm">
                    +{attackBonus} к попаданию • {damage} {attack.damageType}
                  </div>

                  {attack.source === 'item' && (
                    <div className="text-cyan-400 text-xs">От оружия</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(attack)}
                    className="bg-yellow-600 px-2 rounded"
                  >
                    ✎
                  </button>

                  <button
                    onClick={() => deleteAttack(characterId, attack.id)}
                    className="bg-red-600 px-2 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}