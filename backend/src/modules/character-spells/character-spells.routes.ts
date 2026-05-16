import { FastifyInstance } from 'fastify'
import { characterParamsSchema } from '../characters/character.schemas'
import {
  createSpellSchema,
  spellParamsSchema,
  updateSpellSchema,
  setSpellSlotTotalBodySchema,
  spellSlotParamsSchema,
} from './character-spells.schemas'
import { characterSpellsService } from './character-spells.service'
import {
  CharacterNotFoundError,
  SpellNotFoundError,
  SpellOwnershipError,
} from '../characters/errors'
import { SpellSlotConflictError } from '../calculation/spell-slots.rules'


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
      const spell = await characterSpellsService.addSpell(
        paramsParsed.data.id,
        bodyParsed.data,
      )
      return reply.status(201).send(spell)
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
  // Spell slots: set total
  // =========================================================
  // PATCH /characters/:id/spell-slots/:level/total
  //
  // Body:
  // {
  //   "total": 4
  // }
  //
  // Сервер сам решает, что делать с used:
  // если used > total, он будет обрезан до total.
  // =========================================================

  app.patch('/characters/:id/spell-slots/:level/total', async (request, reply) => {
    const parsedParams = spellSlotParamsSchema.safeParse(request.params)

    if (!parsedParams.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: parsedParams.error.format(),
      })
    }

    const parsedBody = setSpellSlotTotalBodySchema.safeParse(request.body)

    if (!parsedBody.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: parsedBody.error.format(),
      })
    }

    try {
      const result = await characterSpellsService.setSpellSlotTotal(
        parsedParams.data.id,
        parsedParams.data.level,
        parsedBody.data.total,
      )

      return reply.send(result)
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof SpellSlotConflictError) {
        return reply.status(409).send({ message: error.message })
      }

      app.log.error(error)

      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  // =========================================================
  // Spell slots: use
  // =========================================================
  // POST /characters/:id/spell-slots/:level/use
  //
  // Использует 1 слот выбранного уровня.
  // =========================================================

  app.post('/characters/:id/spell-slots/:level/use', async (request, reply) => {
    const parsedParams = spellSlotParamsSchema.safeParse(request.params)

    if (!parsedParams.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: parsedParams.error.format(),
      })
    }

    try {
      const result = await characterSpellsService.useSpellSlot(
        parsedParams.data.id,
        parsedParams.data.level,
      )

      return reply.send(result)
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof SpellSlotConflictError) {
        return reply.status(409).send({ message: error.message })
      }

      app.log.error(error)

      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  // =========================================================
  // Spell slots: restore
  // =========================================================
  // POST /characters/:id/spell-slots/:level/restore
  //
  // Восстанавливает 1 слот выбранного уровня.
  // =========================================================

  app.post(
    '/characters/:id/spell-slots/:level/restore',
    async (request, reply) => {
      const parsedParams = spellSlotParamsSchema.safeParse(request.params)

      if (!parsedParams.success) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: parsedParams.error.format(),
        })
      }

      try {
        const result = await characterSpellsService.restoreSpellSlot(
          parsedParams.data.id,
          parsedParams.data.level,
        )

        return reply.send(result)
      } catch (error) {
        if (error instanceof CharacterNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }

        if (error instanceof SpellSlotConflictError) {
          return reply.status(409).send({ message: error.message })
        }

        app.log.error(error)

        return reply.status(500).send({ message: 'Internal server error' })
      }
    },
  )
}