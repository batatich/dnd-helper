import { ForbiddenError, NotFoundError } from '../../shared/errors'

// Ошибка: персонаж не найден
export class CharacterNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Character with id "${id}" not found` : 'Character not found',
      id ? { characterId: id } : undefined,
    )
  }
}

// Ошибка: атака не найдена
export class AttackNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Attack with id "${id}" not found` : 'Attack not found',
      id ? { attackId: id } : undefined,
    )
  }
}

// Ошибка: заклинание не найдено
export class SpellNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Spell with id "${id}" not found` : 'Spell not found',
      id ? { spellId: id } : undefined,
    )
  }
}

// Ошибка: атака не принадлежит персонажу
export class AttackOwnershipError extends ForbiddenError {
  constructor(characterId?: string, attackId?: string) {
    super('Attack does not belong to this character', {
      characterId,
      attackId,
    })
  }
}

// Ошибка: заклинание не принадлежит персонажу
export class SpellOwnershipError extends ForbiddenError {
  constructor(characterId?: string, spellId?: string) {
    super('Spell does not belong to this character', {
      characterId,
      spellId,
    })
  }
}

// Ошибка: предмет персонажа не найден
export class ItemNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Item with id "${id}" not found` : 'Item not found',
      id ? { itemId: id } : undefined,
    )
  }
}

// Ошибка: шаблон предмета не найден
export class ItemTemplateNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Item template with id "${id}" not found` : 'Item template not found',
      id ? { itemTemplateId: id } : undefined,
    )
  }
}

// Ошибка: предмет не принадлежит этому персонажу
export class ItemOwnershipError extends ForbiddenError {
  constructor(characterId?: string, itemId?: string) {
    super('Item does not belong to this character', {
      characterId,
      itemId,
    })
  }
}

// Ошибка: предмет уже экипирован
export class ItemAlreadyEquippedError extends ForbiddenError {
  constructor(itemId?: string) {
    super('Item is already equipped', {
      itemId,
    })
  }
}

// Ошибка: предмет не экипирован
export class ItemNotEquippedError extends ForbiddenError {
  constructor(itemId?: string) {
    super('Item is not equipped', {
      itemId,
    })
  }
}

// Ошибка: у предмета отсутствует слот
export class ItemSlotMissingError extends ForbiddenError {
  constructor(itemId?: string) {
    super('Item slot is missing', {
      itemId,
    })
  }
}

// Ошибка: слот уже занят другим предметом
export class ItemSlotAlreadyOccupiedError extends ForbiddenError {
  constructor(slot: string, characterId?: string) {
    super(`Item slot "${slot}" is already occupied`, {
      slot,
      characterId,
    })
  }
}

// Ошибка: некорректное количество предметов
export class InvalidItemQuantityError extends ForbiddenError {
  constructor(quantity?: number) {
    super('Invalid item quantity', {
      quantity,
    })
  }
}