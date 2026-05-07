import { Card } from '../ui/Card'
import type { Attack, Spell, Stats } from '../../types/characters'

type Props = {
  currentHp: number
  maxHp: number
  temporaryHp: number
  hitDice: {
    total: number
    used: number
    dice: string
  }
  finalStats: Stats
  attacks: Attack[]
  spells: Spell[]
}

const statLabels: Record<keyof Stats, string> = {
  strength: 'СИЛ',
  dexterity: 'ЛОВ',
  constitution: 'ТЕЛ',
  intelligence: 'ИНТ',
  wisdom: 'МДР',
  charisma: 'ХАР',
}

const formatModifier = (value: number) => {
  const modifier = Math.floor((value - 10) / 2)
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

export function OverviewTab({
  currentHp,
  maxHp,
  temporaryHp,
  hitDice,
  finalStats,
  attacks,
  spells,
}: Props) {
  const topAttacks = attacks.slice(0, 3)
  const topSpells = spells.slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-400">Хиты</div>
              <div className="mt-1 text-3xl font-bold text-white">
                {currentHp} / {maxHp}
              </div>

              {temporaryHp > 0 && (
                <div className="mt-1 text-sm text-cyan-400">
                  Временные хиты: {temporaryHp}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-400">Кости хитов</div>
              <div className="mt-1 text-xl font-semibold text-white">
                {hitDice.dice}
              </div>
              <div className="text-sm text-gray-400">
                Использовано: {hitDice.used} / {hitDice.total}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Характеристики
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {(Object.entries(finalStats) as [keyof Stats, number][]).map(
              ([stat, value]) => (
                <div
                  key={stat}
                  className="rounded-lg bg-gray-900/60 p-3 text-center"
                >
                  <div className="text-xs text-gray-400">
                    {statLabels[stat]}
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {value}
                  </div>
                  <div className="text-sm text-gray-300">
                    {formatModifier(value)}
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Быстрые атаки
          </div>

          {topAttacks.length > 0 ? (
            <div className="space-y-3">
              {topAttacks.map((attack) => (
                <div
                  key={attack.id}
                  className="rounded-lg bg-gray-900/60 p-3"
                >
                  <div className="font-semibold text-white">
                    {attack.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {attack.damageDice} {attack.damageType}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Атаки пока не добавлены.
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Заклинания
          </div>

          {topSpells.length > 0 ? (
            <div className="space-y-3">
              {topSpells.map((spell) => (
                <div
                  key={spell.id}
                  className="rounded-lg bg-gray-900/60 p-3"
                >
                  <div className="font-semibold text-white">
                    {spell.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    Уровень {spell.level} • {spell.school || 'Без школы'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Заклинания пока не добавлены.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}