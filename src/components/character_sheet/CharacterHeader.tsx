import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

type HeaderCharacter = {
  id: string
  name: string
  race?: string | null
  class?: string | null
  className?: string | null
  level: number
  alignment?: string | null
  background?: string | null
  avatarUrl?: string | null
}

type Props = {
  character: HeaderCharacter
  onEdit?: () => void
}

export function CharacterHeader({ character, onEdit }: Props) {
  const characterClass = character.className ?? character.class ?? 'Без класса'

  return (
    <Card className="mb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {character.avatarUrl ? (
            <img
              src={character.avatarUrl}
              alt={`${character.name} avatar`}
              className="h-20 w-20 rounded-xl border border-gray-700 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-2xl text-gray-400">
              ?
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-white">
              {character.name || 'Новый персонаж'}
            </h1>

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{character.race || 'Без расы'}</Badge>
              <Badge variant="accent">{characterClass}</Badge>
              <Badge variant="warning">Уровень {character.level}</Badge>
            </div>

            {(character.alignment || character.background) && (
              <div className="mt-2 text-sm text-gray-400">
                {[character.alignment, character.background]
                  .filter(Boolean)
                  .join(' • ')}
              </div>
            )}
          </div>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            Редактировать
          </button>
        )}
      </div>
    </Card>
  )
}