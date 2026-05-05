const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  // Content-Type добавляем только тогда, когда реально есть body.
  // Это важно для DELETE-запросов:
  // если отправить DELETE без body, но с Content-Type: application/json,
  // Fastify может вернуть ошибку:
  // "Body cannot be empty when content-type is set to 'application/json'"
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

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const data = await response.json()
      message = data.message ?? message
    } catch {
      // Сервер мог вернуть не JSON.
      // В таком случае оставляем стандартное сообщение.
    }

    throw new Error(message)
  }

  // DELETE часто возвращает 204 No Content.
  // В таком ответе нет JSON, поэтому response.json() вызвал бы ошибку.
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
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