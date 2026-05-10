import { z } from 'zod'

// =========================================================
// Character Stats
// =========================================================

// Базовое значение характеристики.
// Сейчас разрешаем диапазон 1–30.
//
// Почему 1–30:
// - 1 — минимальное значение, чтобы не было нулевых/отрицательных статов
// - 30 — верхняя безопасная граница для D&D-подобной системы
export const abilityScoreSchema = z.number().int().min(1).max(30)

// Полный набор базовых характеристик персонажа.
//
// Используется для ручной установки статов:
// PATCH /characters/:id/stats
export const characterStatsSchema = z
.object({
  strength: abilityScoreSchema,
  dexterity: abilityScoreSchema,
  constitution: abilityScoreSchema,
  intelligence: abilityScoreSchema,
  wisdom: abilityScoreSchema,
  charisma: abilityScoreSchema,
})
.strict()

// Создание stats.
// При создании / полной ручной установке требуем все 6 характеристик.
export const createCharacterStatsSchema = characterStatsSchema

// Частичное обновление stats.
// Можно будет использовать позже, если понадобится менять один стат отдельно.
export const updateCharacterStatsSchema = characterStatsSchema.partial().strict()

export type CharacterStatsInput = z.infer<typeof characterStatsSchema>
export type CreateCharacterStatsInput = z.infer<
  typeof createCharacterStatsSchema
>
export type UpdateCharacterStatsInput = z.infer<
  typeof updateCharacterStatsSchema
>