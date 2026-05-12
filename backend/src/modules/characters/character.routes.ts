import { FastifyInstance } from 'fastify'
import {
  characterParamsSchema,
  createCharacterSchema,
  updateCharacterSchema,
} from './character.schemas'
import { characterService } from './character.service'
import { CharacterNotFoundError } from './errors'

export async function characterRoutes(app: FastifyInstance) {
  // =========================================================
  // Characters
  // =========================================================

  // Получить список базовых профилей персонажей.
  //
  // Важно:
  // GET /characters не возвращает полный character sheet.
  // Полный лист должен идти через GET /characters/:id/sheet.
  app.get('/characters', async () => {
    return characterService.getCharacters()
  })

  // Получить базовый профиль персонажа по ID.
  //
  // Важно:
  // GET /characters/:id не возвращает stats / attacks / spells / items.
  // Для полного листа использовать GET /characters/:id/sheet.
  app.get('/characters/:id', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterService.getCharacterById(paramsParsed.data.id)
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      throw error
    }
  })

  // Создать персонажа.
  //
  // Создание персонажа возвращает базовый профиль.
  // Stats создаются отдельно внутри repository дефолтными значениями.
  app.post('/characters', async (request, reply) => {
    const bodyParsed = createCharacterSchema.safeParse(request.body)

    if (!bodyParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: bodyParsed.error.flatten(),
      })
    }

    try {
      const character = await characterService.createCharacter(bodyParsed.data)

      return reply.status(201).send(character)
    } catch (error) {
      throw error
    }
  })

  // Обновить только базовые поля персонажа.
  //
  // Важно:
  // HP / death saves / hit dice / inspiration / stats / attacks / spells /
  // inventory здесь не меняются.
  app.patch('/characters/:id', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = updateCharacterSchema.safeParse(request.body)

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
      return await characterService.updateCharacter(
        paramsParsed.data.id,
        bodyParsed.data,
      )
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      throw error
    }
  })

  // Удалить персонажа.
  app.delete('/characters/:id', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      await characterService.deleteCharacter(paramsParsed.data.id)

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      throw error
    }
  })
}