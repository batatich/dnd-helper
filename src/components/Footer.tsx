import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* О проекте */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">О проекте</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-yellow-400 text-sm transition">
                  О проекте
                </Link>
              </li>
              <li>
                <Link to="/authors" className="text-gray-400 hover:text-yellow-400 text-sm transition">
                  Об авторах
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-yellow-400 text-sm transition">
                  Поддержать проект
                </Link>
              </li>
            </ul>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-yellow-400 text-sm transition">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/character" className="text-gray-400 hover:text-yellow-400 text-sm transition">
                  Лист персонажа
                </Link>
              </li>
              <li>
                <Link to="/world" className="text-gray-400 hover:text-yellow-400 text-sm transition">
                  Конструктор мира
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-gray-400 hover:text-yellow-400 text-sm transition">
                  Заметки мастера
                </Link>
              </li>
            </ul>
          </div>

          {/* Об авторах */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Об авторах</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">
                Разработчик: batatich
              </li>
              <li className="text-gray-400 text-sm">
                Создано для D&D сообщества
              </li>
              <li className="text-gray-400 text-sm">
                Версия 1.0.0
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/batatich/dnd-helper" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 text-sm transition flex items-center gap-2"
                >
                  🐙 GitHub
                </a>
              </li>
              <li className="text-gray-400 text-sm">
                📧 support@dnd-helper.ru
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 D&D Helper. Неофициальный фанатский проект. D&D — торговая марка Wizards of the Coast.
          </p>
        </div>
      </div>
    </footer>
  );
}