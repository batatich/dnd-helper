import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-6">📖 О проекте</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-white mb-3">Что такое D&D Helper?</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          D&D Helper — это интерактивная платформа для настольно-ролевых игр, созданная чтобы 
          сделать игру удобнее и увлекательнее. Мы решаем реальные проблемы игроков и мастеров:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
          <li>Автоматический расчет характеристик с учетом экипировки</li>
          <li>Процедурная генерация миров и карт</li>
          <li>Система заметок с привязкой к карте</li>
          <li>Удобный инвентарь с системой слотов</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-white mb-3">Для кого?</h2>
        <p className="text-gray-300">
          Для всех, кто играет в настольно-ролевые игры! Особенно полезно для:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-2">
          <li>Игроков — удобный лист персонажа с авто-расчетами</li>
          <li>Мастеров — инструменты для создания миров и ведения заметок</li>
          <li>IT-компаний — платформа для тимбилдинга через НРИ</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-3">Технологии</h2>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">React</span>
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">TypeScript</span>
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">Tailwind CSS</span>
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">Zustand</span>
        </div>
      </div>
    </div>
  );
}