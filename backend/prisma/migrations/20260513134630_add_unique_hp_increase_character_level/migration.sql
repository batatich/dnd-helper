/*
  Warnings:

  - A unique constraint covering the columns `[characterId,level]` on the table `CharacterHpIncrease` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CharacterHpIncrease_characterId_level_key" ON "CharacterHpIncrease"("characterId", "level");
