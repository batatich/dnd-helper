import { FastifyInstance } from 'fastify'
import { characterParamsSchema } from '../characters/character.schemas'
import {
  hpAmountSchema,
  levelUpSchema,
  setTemporaryHpSchema,
  setInspirationSchema,
} from './character-hp.schemas'
import { characterHpService } from './character-hp.service'
import { CharacterNotFoundError } from '../characters/errors'
import { ValidationError } from '../../shared/errors'

export async function characterHpRoutes(app: FastifyInstance) {
  // Повысить уровень персонажа.
  // hpMode:
  // fixed — прибавить фиксированное значение HP, сейчас +5 для 1d8
  // roll — сервер бросает кость хитов, сейчас 1d8
  app.post('/characters/:id/level-up', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = levelUpSchema.safeParse(request.body)

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
      return await characterHpService.levelUpCharacter(
        paramsParsed.data.id,
        bodyParsed.data.hpMode,
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

  // Нанести урон персонажу
  app.post('/characters/:id/hp/damage', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = hpAmountSchema.safeParse(request.body)

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
      return await characterHpService.damageCharacter(
        paramsParsed.data.id,
        bodyParsed.data.amount,
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

  // Исцелить персонажа
  app.post('/characters/:id/hp/heal', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = hpAmountSchema.safeParse(request.body)

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
      return await characterHpService.healCharacter(
        paramsParsed.data.id,
        bodyParsed.data.amount,
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

  // Установить temporary HP персонажу
  app.post('/characters/:id/hp/temp', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = setTemporaryHpSchema.safeParse(request.body)

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
      return await characterHpService.setTempHp(
        paramsParsed.data.id,
        bodyParsed.data.amount,
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

  // Использовать 1 кость хитов
  app.post('/characters/:id/hit-dice/use', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterHpService.useHitDie(paramsParsed.data.id)
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

  // Восстановить 1 использованную кость хитов
  app.post('/characters/:id/hit-dice/restore', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterHpService.restoreHitDie(paramsParsed.data.id)
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

  // Установить вдохновение персонажа
  app.patch('/characters/:id/inspiration', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = setInspirationSchema.safeParse(request.body)

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
      return await characterHpService.setInspiration(
        paramsParsed.data.id,
        bodyParsed.data.inspiration,
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

  // Добавить успешный death save
  app.post('/characters/:id/death-saves/success', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterHpService.addDeathSaveSuccess(paramsParsed.data.id)
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

  // Добавить проваленный death save
  app.post('/characters/:id/death-saves/failure', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterHpService.addDeathSaveFailure(paramsParsed.data.id)
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

  // Сбросить death saves
  app.post('/characters/:id/death-saves/reset', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterHpService.resetDeathSaves(paramsParsed.data.id)
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