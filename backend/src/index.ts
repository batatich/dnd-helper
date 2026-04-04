import Fastify from 'fastify'
import cors from '@fastify/cors'
import { prisma } from './lib/prisma'
import { characterRoutes } from './modules/characters/character.routes'

const app = Fastify({
  logger: true,
})

const start = async () => {
  try {
    await app.register(cors, {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })

    app.get('/health', async () => {
      return { status: 'ok' }
    })

    app.get('/db-check', async () => {
      const count = await prisma.character.count()

      return {
        status: 'ok',
        charactersCount: count,
      }
    })

    await app.register(characterRoutes)

    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Backend started on http://localhost:3000')
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()