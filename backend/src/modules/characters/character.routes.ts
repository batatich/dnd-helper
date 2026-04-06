import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import {
  createCharacterSchema,
  updateCharacterSchema,
} from './character.schemas'

export async function characterRoutes(app: FastifyInstance) {
  app.get('/characters', async () => {
    const characters = await prisma.character.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return characters
  })

  app.get('/characters/:id', async (request, reply) => {
    const params = request.params as { id: string }

    const character = await prisma.character.findUnique({
      where: { id: params.id },
    })

    if (!character) {
      return reply.status(404).send({
        message: 'Character not found',
      })
    }

    return character
  })

  app.post('/characters', async (request, reply) => {
    const parsed = createCharacterSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: parsed.error.flatten(),
      })
    }

    const data = parsed.data

    const character = await prisma.character.create({
      data: {
        name: data.name,
        race: data.race,
        className: data.className,
        level: data.level ?? 1,
        description: data.description,
        alignment: data.alignment,
        background: data.background,
        avatarUrl: data.avatarUrl || null,
        currentHp: data.currentHp ?? 0,
        temporaryHp: data.temporaryHp ?? 0,
        speed: data.speed ?? 30,
        inspiration: data.inspiration ?? false,
      },
    })

    return reply.status(201).send(character)
  })

  app.patch('/characters/:id', async (request, reply) => {
    const params = request.params as { id: string }
    const parsed = updateCharacterSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: parsed.error.flatten(),
      })
    }

    const existingCharacter = await prisma.character.findUnique({
      where: { id: params.id },
    })

    if (!existingCharacter) {
      return reply.status(404).send({
        message: 'Character not found',
      })
    }

    const data = parsed.data

    const updatedCharacter = await prisma.character.update({
      where: { id: params.id },
      data: {
        ...data,
        avatarUrl: data.avatarUrl === '' ? null : data.avatarUrl,
      },
    })

    return updatedCharacter
  })

  app.delete('/characters/:id', async (request, reply) => {
    const params = request.params as { id: string }

    const existingCharacter = await prisma.character.findUnique({
      where: { id: params.id },
    })

    if (!existingCharacter) {
      return reply.status(404).send({
        message: 'Character not found',
      })
    }

    await prisma.character.delete({
      where: { id: params.id },
    })

    return reply.status(204).send()
  })
}