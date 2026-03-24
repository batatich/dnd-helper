export function Support() {
  const handleSupport = (method: string) => {
    alert(`Спасибо за интерес к поддержке проекта! 💝\n\nСпособ: ${method}\n\nВ ближайшее время добавлю детали.`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-6">☕ Поддержать проект</h1>
      
      <div className="bg-gray-800 rounded-lg p-8 text-center mb-6">
        <div className="text-6xl mb-4">🎲</div>
        <p className="text-gray-300 text-lg mb-6">
          Если D&D Helper помогает тебе в играх — поддержи развитие проекта!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => handleSupport('GitHub Sponsors')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>🐙</span> GitHub Sponsors
          </button>
          <button 
            onClick={() => handleSupport('Boosty')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>⭐</span> Boosty
          </button>
          <button 
            onClick={() => handleSupport('DonationAlerts')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>💝</span> DonationAlerts
          </button>
          <button 
            onClick={() => handleSupport('Криптовалюта')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>₿</span> Криптовалюта
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-3">На что пойдут средства?</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
          <li>Хостинг и сервера</li>
          <li>Разработка новых функций</li>
          <li>Интеграция с API нейросетей</li>
          <li>Поддержка и развитие проекта</li>
        </ul>
      </div>
    </div>
  );
}