import { FastifyInstance } from 'fastify'
import {
  attackParamsSchema,
  characterParamsSchema,
  createAttackSchema,
  createCharacterSchema,
  createItemSchema,
  createSpellSchema,
  hpAmountSchema,
  itemParamsSchema,
  spellParamsSchema,
  updateAttackSchema,
  updateCharacterSchema,
  updateItemSchema,
  updateSpellSchema,
  updateSpellSlotsSchema,
} from './character.schemas'
import { characterService } from './character.service'
import {
  AttackNotFoundError,
  AttackOwnershipError,
  CharacterNotFoundError,
  InvalidItemQuantityError,
  ItemAlreadyEquippedError,
  ItemNotEquippedError,
  ItemNotFoundError,
  ItemOwnershipError,
  ItemSlotAlreadyOccupiedError,
  ItemSlotMissingError,
  ItemTemplateNotFoundError,
  SpellNotFoundError,
  SpellOwnershipError,
} from './errors'
import { ValidationError } from '../../shared/errors'

export async function characterRoutes(app: FastifyInstance) {
  // =========================================================
  // Characters
  // =========================================================

  // Получить список всех персонажей
  app.get('/characters', async () => {
    return characterService.getCharacters()
  })

  // Получить персонажа по ID
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

  // Создать персонажа
  app.post('/characters', async (request, reply) => {
    const bodyParsed = createCharacterSchema.safeParse(request.body)

    if (!bodyParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: bodyParsed.error.flatten(),
      })
    }

    const character = await characterService.createCharacter(bodyParsed.data)

    return reply.status(201).send(character)
  })

  // Обновить базовые поля персонажа
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

  // Удалить персонажа
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

  // =========================================================
  // HP
  // =========================================================

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
      return await characterService.damageCharacter(
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
      return await characterService.healCharacter(
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
      return await characterService.setTempHp(
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

  // =========================================================
  // Attacks
  // =========================================================

  // Добавить атаку персонажу
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
      return await characterService.addAttack(
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
      return await characterService.updateAttack(
        paramsParsed.data.id,
        paramsParsed.data.attackId,
        bodyParsed.data,
      )
    } catch (error) {
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
      await characterService.deleteAttack(
        paramsParsed.data.id,
        paramsParsed.data.attackId,
      )

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof AttackNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof AttackOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })

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
      return await characterService.addSpell(
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
      return await characterService.updateSpell(
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
      await characterService.deleteSpell(
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
      return await characterService.updateSpellSlots(
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

  // =========================================================
  // Items / Inventory
  // =========================================================

  // Получить список всех шаблонов предметов
  app.get('/items', async () => {
    return characterService.getItemTemplates()
  })

  // Добавить предмет в инвентарь персонажа
  app.post('/characters/:id/items', async (request, reply) => {
    const paramsParsed = characterParamsSchema.safeParse(request.params)
    const bodyParsed = createItemSchema.safeParse(request.body)

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
      const item = await characterService.addItem(
        paramsParsed.data.id,
        bodyParsed.data,
      )

      return reply.status(201).send(item)
    } catch (error) {
      if (error instanceof CharacterNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemTemplateNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof InvalidItemQuantityError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof ItemSlotMissingError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof ItemSlotAlreadyOccupiedError) {
        return reply.status(409).send({ message: error.message })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      throw error
    }
  })

  // Обновить предмет персонажа
  app.patch('/characters/:id/items/:itemId', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)
    const bodyParsed = updateItemSchema.safeParse(request.body)

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
      return await characterService.updateItem(
        paramsParsed.data.id,
        paramsParsed.data.itemId,
        bodyParsed.data,
      )
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      if (error instanceof InvalidItemQuantityError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof ItemSlotMissingError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof ItemSlotAlreadyOccupiedError) {
        return reply.status(409).send({ message: error.message })
      }

      throw error
    }
  })

  // Удалить предмет персонажа
  app.delete('/characters/:id/items/:itemId', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      await characterService.deleteItem(
        paramsParsed.data.id,
        paramsParsed.data.itemId,
      )

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      throw error
    }
  })

  // Экипировать предмет
  app.post('/characters/:id/items/:itemId/equip', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterService.equipItem(
        paramsParsed.data.id,
        paramsParsed.data.itemId,
      )
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      if (error instanceof ItemAlreadyEquippedError) {
        return reply.status(409).send({ message: error.message })
      }

      if (error instanceof ItemSlotMissingError) {
        return reply.status(400).send({ message: error.message })
      }

      if (error instanceof ItemSlotAlreadyOccupiedError) {
        return reply.status(409).send({ message: error.message })
      }

      throw error
    }
  })

  // Снять предмет
  app.post('/characters/:id/items/:itemId/unequip', async (request, reply) => {
    const paramsParsed = itemParamsSchema.safeParse(request.params)

    if (!paramsParsed.success) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: paramsParsed.error.flatten(),
      })
    }

    try {
      return await characterService.unequipItem(
        paramsParsed.data.id,
        paramsParsed.data.itemId,
      )
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ItemOwnershipError) {
        return reply.status(403).send({ message: error.message })
      }

      if (error instanceof ItemNotEquippedError) {
        return reply.status(409).send({ message: error.message })
      }

      throw error
    }
  })
}