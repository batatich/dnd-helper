import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { CharacterNotFoundError } from '../characters/errors'
import { characterParamsSchema } from '../characters/character.schemas'
import { CharacterSheetService } from './character-sheet.service'

type CharacterSheetRouteDeps = {
  characterSheetService: CharacterSheetService
}

type CharacterParams = {
  id: string
}

export async function characterSheetRoutes(
  app: FastifyInstance,
  deps: CharacterSheetRouteDeps,
) {
  const { characterSheetService } = deps

  app.get(
    '/characters/:id/sheet',
    async (
      request: FastifyRequest<{ Params: CharacterParams }>,
      reply: FastifyReply,
    ) => {
      const parsed = characterParamsSchema.safeParse(request.params)

      if (!parsed.success) {
        return reply.status(400).send({ message: 'Validation error' })
      }

      try {
        const sheet = await characterSheetService.getCharacterSheet(parsed.data.id)
        return reply.send(sheet)
      } catch (error: unknown) {
        if (error instanceof CharacterNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }

        return reply.status(500).send({ message: 'Internal server error' })
      }
    },
  )
}