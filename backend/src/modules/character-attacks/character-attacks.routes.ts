import { FastifyInstance } from 'fastify'
import { characterParamsSchema } from '../characters/character.schemas'
import {
  attackParamsSchema,
  createAttackSchema,
  updateAttackSchema,
} from './character-attacks.schemas'
import { characterAttacksService } from './character-attacks.service'
import {
  AttackNotFoundError,
  AttackOwnershipError,
  CharacterNotFoundError,
} from '../characters/errors'
import { ValidationError } from '../../shared/errors'

export async function characterAttacksRoutes(app: FastifyInstance) {
  // =========================================================
  // Character Attacks
  // =========================================================

  // Создать атаку персонажа
  app.post('/characters/:id/attacks', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = createAttackSchema.safeParse(request.body)

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
      const attack = await characterAttacksService.addAttack(
        paramsParsed.data.id,
        bodyParsed.data,
      )
      return reply.status(201).send(attack)
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

  // Обновить атаку персонажа
  app.patch('/characters/:id/attacks/:attackId', async (request, reply) => {
    const paramsParsed = attackParamsSchema.safeParse(request.params)
    const bodyParsed = updateAttackSchema.safeParse(request.body)

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
      return await characterAttacksService.updateAttack(
        paramsParsed.data.id,
        paramsParsed.data.attackId,
        bodyParsed.data,
      )
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }
      if (error instanceof AttackNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof AttackOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })

  // Удалить атаку персонажа
  app.delete('/characters/:id/attacks/:attackId', async (request, reply) => {
    const paramsParsed = attackParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      await characterAttacksService.deleteAttack(
        paramsParsed.data.id,
        paramsParsed.data.attackId,
      )

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof AttackNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof AttackOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })
}