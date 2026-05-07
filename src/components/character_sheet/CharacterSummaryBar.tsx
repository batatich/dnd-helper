import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

type Props = {
  armorClass: number
  initiative: number
  speed: number
  proficiencyBonus: number
  inspiration: boolean
  onToggleInspiration?: () => void
}

export function CharacterSummaryBar({
  armorClass,
  initiative,
  speed,
  proficiencyBonus,
  inspiration,
  onToggleInspiration,
}: Props) {
  const initiativeLabel = initiative >= 0 ? `+${initiative}` : `${initiative}`

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
      <Card className="text-center">
        <div className="text-sm text-gray-400">Класс брони</div>
        <div className="mt-1 text-2xl font-bold text-white">
          {armorClass}
        </div>
      </Card>

      <Card className="text-center">
        <div className="text-sm text-gray-400">Инициатива</div>
        <div className="mt-1 text-2xl font-bold text-white">
          {initiativeLabel}
        </div>
      </Card>

      <Card className="text-center">
        <div className="text-sm text-gray-400">Скорость</div>
        <div className="mt-1 text-2xl font-bold text-white">
          {speed} фт.
        </div>
      </Card>

      <Card className="text-center">
        <div className="text-sm text-gray-400">Бонус мастерства</div>
        <div className="mt-1 text-2xl font-bold text-white">
          +{proficiencyBonus}
        </div>
      </Card>

      <Card className="text-center">
        <div className="text-sm text-gray-400">Вдохновение</div>

        <div className="mt-2 flex justify-center">
          <Badge variant={inspiration ? 'warning' : 'default'}>
            {inspiration ? 'Есть' : 'Нет'}
          </Badge>
        </div>

        {onToggleInspiration && (
          <button
            type="button"
            onClick={onToggleInspiration}
            className="mt-3 rounded-lg bg-yellow-600 px-3 py-1 text-sm text-white transition hover:bg-yellow-700"
          >
            {inspiration ? 'Снять' : 'Выдать'}
          </button>
        )}
      </Card>
    </div>
  )
}