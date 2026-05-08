import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { Attack, Spell, Stats, SpellSlot } from '../../types/characters'

type SkillPreview = {
  name: string
  bonus: number
  proficient?: boolean
}

type SavingThrowPreview = {
  label: string
  bonus: number
  proficient?: boolean
}

type HitDice = {
  total: number
  used: number
  dice: string
}

type Props = {
  currentHp: number
  maxHp: number
  temporaryHp: number
  hitDice: HitDice
  finalStats: Stats
  modifiers: Stats
  attacks: Attack[]
  spells: Spell[]
  spellSlots: SpellSlot[]
  skills: SkillPreview[]
  savingThrows: SavingThrowPreview[]
}

const statLabels: Record<keyof Stats, string> = {
  strength: 'СИЛ',
  dexterity: 'ЛОВ',
  constitution: 'ТЕЛ',
  intelligence: 'ИНТ',
  wisdom: 'МДР',
  charisma: 'ХАР',
}

const formatBonus = (value: number) => {
  return value >= 0 ? `+${value}` : `${value}`
}

export function OverviewTab({
  currentHp,
  maxHp,
  temporaryHp,
  hitDice,
  finalStats,
  modifiers,
  attacks,
  spells,
  spellSlots,
  skills,
  savingThrows,
}: Props) {
  const visibleAttacks = attacks.slice(0, 3)
  const visibleSpells = spells.slice(0, 3)
  const hiddenAttacksCount = Math.max(attacks.length - visibleAttacks.length, 0)
  const hiddenSpellsCount = Math.max(spells.length - visibleSpells.length, 0)
  const visibleSkills = skills.slice(0, 6)
  const visibleSavingThrows = savingThrows.slice(0, 6)

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <div className="text-sm text-gray-400">Хиты</div>

            <div className="mt-1 flex items-end gap-2">
              <div className="text-3xl font-bold text-white">
                {currentHp}
              </div>
              <div className="pb-1 text-sm text-gray-400">
                / {maxHp}
              </div>
            </div>

            {temporaryHp > 0 && (
              <div className="mt-2">
                <Badge variant="success">
                  Временные хиты: {temporaryHp}
                </Badge>
              </div>
            )}
          </Card>

          <Card>
            <div className="text-sm text-gray-400">Кости хитов</div>

            <div className="mt-1 text-2xl font-bold text-white">
              {hitDice.dice}
            </div>

            <div className="mt-1 text-sm text-gray-400">
              Использовано: {hitDice.used} / {hitDice.total}
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Характеристики
          </div>

          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {(Object.entries(finalStats) as [keyof Stats, number][]).map(
              ([stat, value]) => (
                <div
                  key={stat}
                  className="rounded-lg bg-gray-900/60 p-2 text-center"
                >
                  <div className="text-xs text-gray-400">
                    {statLabels[stat]}
                  </div>

                  <div className="text-xl font-bold text-white">
                    {value}
                  </div>

                  <div className="text-xs text-gray-300">
                    {formatBonus(modifiers[stat])}
                  </div>
                </div>
              )
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Спасброски
            </div>

            <div className="grid grid-cols-2 gap-2">
              {visibleSavingThrows.map((save) => (
                <div
                  key={save.label}
                  className="flex items-center justify-between rounded-lg bg-gray-900/60 px-3 py-2"
                >
                  <div className="text-sm text-gray-300">
                    {save.label}
                  </div>

                  <div className="flex items-center gap-2">
                    {save.proficient && (
                      <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    )}

                    <div className="text-sm font-bold text-white">
                      {formatBonus(save.bonus)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Навыки
            </div>

            <div className="grid grid-cols-1 gap-2">
              {visibleSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between rounded-lg bg-gray-900/60 px-3 py-2"
                >
                  <div className="text-sm text-gray-300">
                    {skill.name}
                  </div>

                  <div className="flex items-center gap-2">
                    {skill.proficient && (
                      <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    )}

                    <div className="text-sm font-bold text-white">
                      {formatBonus(skill.bonus)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Быстрые атаки
          </div>

          {visibleAttacks.length > 0 ? (
            <div className="space-y-2">
              {visibleAttacks.map((attack) => (
                <div
                  key={attack.id}
                  className="rounded-lg bg-gray-900/60 p-3"
                >
                  <div className="font-semibold text-white">
                    {attack.name}
                  </div>

                  <div className="mt-1 text-sm text-gray-400">
                    {attack.damageDice || '—'} {attack.damageType || ''}
                  </div>
                </div>
              ))}

              {hiddenAttacksCount > 0 && (
                <div className="text-xs text-gray-500">
                  Ещё атак: {hiddenAttacksCount}
                </div>
              )}
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

          {visibleSpells.length > 0 ? (
            <div className="space-y-2">
              {visibleSpells.map((spell) => (
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

            {hiddenSpellsCount > 0 && (
              <div className="text-xs text-gray-500">
                Ещё заклинаний: {hiddenSpellsCount}
              </div>
            )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Заклинания пока не добавлены.
            </div>
          )}

        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Ячейки заклинаний
          </div>

          {spellSlots.length > 0 ? (
            <div className="space-y-2">
              {spellSlots.map((slot) => (
                <div
                  key={slot.level}
                  className="flex items-center justify-between rounded-lg bg-gray-900/60 px-3 py-2"
                >
                  <div className="text-sm text-gray-300">
                    Уровень {slot.level}
                  </div>

                  <div className="text-sm font-bold text-white">
                    {slot.used} / {slot.total}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Ячейки не настроены.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}