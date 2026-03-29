import { Link, useLocation } from 'react-router-dom';
import { Home, Sword, Map, BookOpen, Sparkles, PlusSquare } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/characters', label: 'Персонажи', icon: Sword },
    { path: '/world', label: 'Конструктор мира', icon: Map },
    { path: '/notes', label: 'Заметки мастера', icon: BookOpen },
    { path: '/items/create', label: 'Создать предмет', icon: PlusSquare },
  ];

  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Логотип слева */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-yellow-400 group-hover:to-orange-400 transition">
              D&D Helper
            </span>
          </Link>

          {/* Навигационные кнопки */}
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}