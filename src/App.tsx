function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        D&D Helper - Запущен!
      </h1>
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
        <p className="text-xl mb-4 text-green-400">
          Все библиотеки установлены!
        </p>
        <div className="space-y-2 text-gray-300">
          <p>React + TypeScript работает</p>
          <p>Tailwind CSS настроен</p>
          <p>Готов к созданию D&D инструментов</p>
        </div>
        <button className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold w-full transition-colors">
          Начать создание
        </button>
      </div>
    </div>
  );
}

export default App;
