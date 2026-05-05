import Fastify from 'fastify'
import cors from '@fastify/cors'

import { prisma } from './lib/prisma'

import { characterRoutes } from './modules/characters/character.routes'
import { characterRepository } from './modules/characters/character.repository'

import { characterSheetRoutes } from './modules/character-sheet/character-sheet.routes'
import { CharacterSheetService } from './modules/character-sheet/character-sheet.service'

const app = Fastify({
  logger: true,
})

// =========================================================
// Адаптеры для CharacterSheetService
// =========================================================
// У тебя сейчас нет отдельных repository-файлов для stats/attacks/spells/items,
// поэтому мы берём методы из общего characterRepository
// и передаём их в CharacterSheetService в нужном формате.

const characterForSheetRepository = {
  findById: (id: string) =>
    characterRepository.findByIdWithSheet(id) as Promise<any>,
}

const characterStatsRepository = {
  findByCharacterId: (characterId: string) =>
    characterRepository.findStatsByCharacterId(characterId),
}

const characterAttackRepository = {
  findByCharacterId: (characterId: string) =>
    characterRepository.findAttacksByCharacterId(characterId),
}

const characterSpellRepository = {
  findByCharacterId: (characterId: string) =>
    characterRepository.findSpellsByCharacterId(characterId),
}

const characterItemRepository = {
  findByCharacterId: (characterId: string) =>
    characterRepository.findItemsByCharacterId(characterId),
}

// =========================================================
// Сервис готового character sheet
// =========================================================
// Именно он должен возвращать derived.maxHp, hitDice, hpIncreases и т.д.

const characterSheetService = new CharacterSheetService(
  characterForSheetRepository,
  characterStatsRepository,
  characterAttackRepository,
  characterSpellRepository,
  characterItemRepository,
)

const start = async () => {
  try {
    // =========================================================
    // CORS
    // =========================================================
    await app.register(cors, {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })

    // =========================================================
    // Health check
    // =========================================================
    app.get('/health', async () => {
      return { status: 'ok' }
    })

    // =========================================================
    // Проверка подключения к базе
    // =========================================================
    app.get('/db-check', async () => {
      const count = await prisma.character.count()

      return {
        status: 'ok',
        charactersCount: count,
      }
    })

    // =========================================================
    // ВАЖНО:
    // characterSheetRoutes регистрируем ДО characterRoutes.
    //
    // Иначе маршрут:
    // GET /characters/:id
    //
    // может перехватить:
    // GET /characters/:id/sheet
    //
    // и ты снова получишь обычного персонажа без derived.
    // =========================================================
    await app.register(characterSheetRoutes, {
      characterSheetService,
    })

    // =========================================================
    // Основные маршруты персонажей
    // =========================================================
    await app.register(characterRoutes)

    // =========================================================
    // Запуск сервера
    // =========================================================
    await app.listen({ port: 3000, host: '0.0.0.0' })

    console.log('Backend started on http://localhost:3000')
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()