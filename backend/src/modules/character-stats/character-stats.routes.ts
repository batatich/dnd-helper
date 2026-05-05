import { FastifyInstance } from 'fastify'
import { characterParamsSchema } from '../characters/character.schemas'
import { characterStatsSchema } from './character-stats.schemas'
import { characterStatsService } from './character-stats.service'
import { CharacterNotFoundError } from '../characters/errors'
import { ValidationError } from '../../shared/errors'

export async function characterStatsRoutes(app: FastifyInstance) {
  // =========================================================
  // Character Stats
  // =========================================================

  // Ручное обновление базовых характеристик персонажа.
  // Фронт отправляет полный набор из 6 статов.
  app.patch('/characters/:id/stats', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = characterStatsSchema.safeParse(request.body)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    if (!bodyParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: bodyParsed.error.flatten(),
      })
    }

    try {
      return await characterStatsService.updateCharacterStats(
        paramsParsed.data.id,
        bodyParsed.data,
      )
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      throw error
    }
  })

  // Генерация базовых характеристик через 4d6 drop lowest.
  // Body не нужен: сервер сам кидает кубы для всех 6 статов.
  app.post('/characters/:id/stats/roll', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterStatsService.rollCharacterStats(paramsParsed.data.id)
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      throw error
    }
  })
}