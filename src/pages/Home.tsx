import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Герой-секция */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            D&D Helper
          </h1>
          <p className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto">
            Твой персональный помощник в мире настольно-ролевых игр
          </p>
          <Link 
            to="/character" 
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 rounded-xl transition-all"
          >
            Начать приключение
          </Link>
        </div>
      </div>

      {/* Секция с модулями */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Основные модули
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Карточка персонажа */}
          <Link to="/character" className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-all">
            <div className="text-4xl mb-3">📜</div>
            <h3 className="text-xl font-semibold text-white mb-2">Лист персонажа</h3>
            <p className="text-gray-400">Интерактивный лист с автоматическим расчетом характеристик</p>
          </Link>

          {/* Карточка мира */}
          <Link to="/world" className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-all">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Конструктор мира</h3>
            <p className="text-gray-400">Создавай уникальные миры с процедурной генерацией</p>
          </Link>

          {/* Карточка заметок */}
          <Link to="/notes" className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-all">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">Заметки мастера</h3>
            <p className="text-gray-400">Веди заметки, привязывай их к карте</p>
          </Link>
        </div>
      </div>
    </div>
  );
}