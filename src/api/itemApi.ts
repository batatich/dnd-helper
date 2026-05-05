import { httpClient } from './httpClient.ts'

export type ItemTemplate = {
  id: string
  name: string
  type?: string | null
  slot?: string | null
  description?: string | null
  effects?: unknown
  createdAt: string
  updatedAt: string
}

export function getItemTemplates(): Promise<ItemTemplate[]> {
  return httpClient.get<ItemTemplate[]>('/items')
}