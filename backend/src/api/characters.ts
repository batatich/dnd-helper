import { api } from '../lib/api'

export type Character = {
  id: string
  name: string
  race: string
  className: string
  level: number
  description?: string | null
  alignment?: string | null
  background?: string | null
  avatarUrl?: string | null
  currentHp: number
  temporaryHp: number
  speed: number
  inspiration: boolean
  createdAt: string
  updatedAt: string
}

export type CreateCharacterDto = {
  name: string
  race: string
  className: string
  level: number
  description?: string
  alignment?: string
  background?: string
  avatarUrl?: string
  currentHp?: number
  temporaryHp?: number
  speed?: number
  inspiration?: boolean
}

export async function getCharacters() {
  const response = await api.get<Character[]>('/characters')
  return response.data
}

export async function getCharacterById(id: string) {
  const response = await api.get<Character>(`/characters/${id}`)
  return response.data
}

export async function createCharacter(data: CreateCharacterDto) {
  const response = await api.post<Character>('/characters', data)
  return response.data
}

export async function updateCharacter(
  id: string,
  data: Partial<CreateCharacterDto>,
) {
  const response = await api.patch<Character>(`/characters/${id}`, data)
  return response.data
}

export async function deleteCharacter(id: string) {
  await api.delete(`/characters/${id}`)
}