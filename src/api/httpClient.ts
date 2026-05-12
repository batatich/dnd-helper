const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  // Content-Type добавляем только тогда, когда реально есть body.
  // Это важно для Fastify:
  // если отправить запрос без body, но с Content-Type: application/json,
  // backend может вернуть ошибку empty JSON body.
  const headers: HeadersInit = {
    ...(options.body !== undefined
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  })

  const text = await response.text()

  if (!response.ok) {
    let message = 'Request failed'

    if (text) {
      try {
        const data = JSON.parse(text) as {
          message?: string
          error?: string
        }

        message = data.message ?? data.error ?? message
      } catch {
        message = text
      }
    }

    throw new Error(message)
  }

  // 204 No Content или 200/201 без body.
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export const httpClient = {
  get<T>(path: string) {
    return request<T>(path, {
      method: 'GET',
    })
  },

  post<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'POST',
      body,
    })
  },

  patch<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'PATCH',
      body,
    })
  },

  delete<T>(path: string) {
    return request<T>(path, {
      method: 'DELETE',
    })
  },
}