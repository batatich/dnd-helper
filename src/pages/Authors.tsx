export function Authors() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-6">👥 Об авторах</h1>
      
      <div className="bg-gray-800 rounded-lg p-8 text-center mb-6">
        <div className="text-6xl mb-4">🧙‍♂️</div>
        <h2 className="text-2xl font-semibold text-white mb-2">batatich</h2>
        <p className="text-gray-300 mb-4">
          Разработчик, энтузиаст D&D, создатель D&D Helper
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="https://github.com/batatich" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            GitHub →
          </a>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-3">Почему я создал этот проект?</h2>
        <p className="text-gray-300 leading-relaxed">
          Как большой фанат настольно-ролевых игр, я часто сталкивался с проблемами 
          бумажных листов и статичных калькуляторов. D&D Helper — мой способ сделать 
          игру удобнее для всех. Проект открытый, и я рад любой обратной связи!
        </p>
      </div>
    </div>
  );
}