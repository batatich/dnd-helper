export type AppErrorDetails = Record<string, unknown>

// Базовая ошибка приложения.
// Все доменные и HTTP-ошибки наследуются от неё.
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: AppErrorDetails

  constructor(
    message: string,
    statusCode = 500,
    code = 'APP_ERROR',
    details?: AppErrorDetails,
  ) {
    super(message)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// Ошибка валидации входных данных
export class ValidationError extends AppError {
  constructor(message = 'Validation error', details?: AppErrorDetails) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

// Ошибка "ресурс не найден"
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: AppErrorDetails) {
    super(message, 404, 'NOT_FOUND', details)
  }
}

// Ошибка доступа
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: AppErrorDetails) {
    super(message, 403, 'FORBIDDEN', details)
  }
}

// Ошибка конфликта состояния
export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: AppErrorDetails) {
    super(message, 409, 'CONFLICT', details)
  }
}