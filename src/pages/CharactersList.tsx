import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCharacterStore } from '../stores/characterStore'
import { CharacterForm } from '../components/CharacterForm'
import type { Character } from '../types/characters'

export function CharactersList() {
  const {
    characters,
    deleteCharacter,
    setCurrentCharacter,
    fetchCharacters,
    isLoading,
    error,
  } = useCharacterStore()

  const [showForm, setShowForm] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)

  useEffect(() => {
    void fetchCharacters()
  }, [fetchCharacters])

  const handleCreateCharacter = () => {
    setEditingCharacter(null)
    setCurrentCharacter(null)
    setShowForm(true)
  }

  const handleEdit = (character: Character) => {
    setEditingCharacter(character)
    setCurrentCharacter(character)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Удалить персонажа?')) {
      await deleteCharacter(id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCharacter(null)
    setCurrentCharacter(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">📜 Мои персонажи</h1>
        <button
          onClick={handleCreateCharacter}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <span>+</span> Создать персонажа
        </button>
      </div>

      {isLoading && (
        <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-300 mb-6">
          Загрузка персонажей...
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-red-200 mb-6">
          {error}
        </div>
      )}

      {!isLoading && characters.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">У вас пока нет персонажей</p>
          <button
            onClick={handleCreateCharacter}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold"
          >
            Создать первого персонажа
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-white">{char.name}</h2>
                  <span className="text-yellow-400 text-sm">Ур. {char.level}</span>
                </div>

                <p className="text-gray-300 mb-2">
                  {char.race} • {char.class}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                  <div className="bg-gray-700 rounded p-1">
                    <div className="text-gray-400">Сила</div>
                    <div className="text-white font-bold">{char.baseStats.strength}</div>
                  </div>
                  <div className="bg-gray-700 rounded p-1">
                    <div className="text-gray-400">Ловк</div>
                    <div className="text-white font-bold">{char.baseStats.dexterity}</div>
                  </div>
                  <div className="bg-gray-700 rounded p-1">
                    <div className="text-gray-400">Тело</div>
                    <div className="text-white font-bold">{char.baseStats.constitution}</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Link
                    to={`/character/${char.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-center py-2 rounded-lg transition text-sm"
                  >
                    Открыть
                  </Link>
                  <button
                    onClick={() => handleEdit(char)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => void handleDelete(char.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {editingCharacter ? 'Редактировать персонажа' : 'Создать персонажа'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <CharacterForm
                character={editingCharacter}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}