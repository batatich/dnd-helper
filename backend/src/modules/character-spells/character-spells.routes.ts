import { FastifyInstance } from 'fastify'
import { characterParamsSchema } from '../characters/character.schemas'
import {
  createSpellSchema,
  spellParamsSchema,
  updateSpellSchema,
  updateSpellSlotsSchema,
} from './character-spells.schemas'
import { characterSpellsService } from './character-spells.service'
import { CharacterNotFoundError } from '../characters/errors'
import {
  SpellNotFoundError,
  SpellOwnershipError,
} from '../characters/errors'
import { ValidationError } from '../../shared/errors'


export async function characterSpellsRoutes(app: FastifyInstance) {
  // =========================================================
  // Spells
  // =========================================================

  // Добавить заклинание персонажу
  app.post('/characters/:id/spells', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = createSpellSchema.safeParse(request.body)

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
      return await characterSpellsService.addSpell(
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

  // Обновить заклинание персонажа
  app.patch('/characters/:id/spells/:spellId', async (request, reply) => {
    const paramsParsed = spellParamsSchema.safeParse(request.params)
    const bodyParsed = updateSpellSchema.safeParse(request.body)

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
      return await characterSpellsService.updateSpell(
        paramsParsed.data.id,
        paramsParsed.data.spellId,
        bodyParsed.data,
      )
    } catch (error) {
      if (error instanceof SpellNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof SpellOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })

  // Удалить заклинание персонажа
  app.delete('/characters/:id/spells/:spellId', async (request, reply) => {
    const paramsParsed = spellParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      await characterSpellsService.deleteSpell(
        paramsParsed.data.id,
        paramsParsed.data.spellId,
      )

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof SpellNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof SpellOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })

  // =========================================================
  // Spell slots
  // =========================================================

  // Обновить spell slots персонажа
  app.patch('/characters/:id/spell-slots', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = updateSpellSlotsSchema.safeParse(request.body)

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
      return await characterSpellsService.updateSpellSlots(
        paramsParsed.data.id,
        bodyParsed.data.spellSlots,
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
}