/*
  Warnings:

  - A unique constraint covering the columns `[characterId,equippedSlot]` on the table `CharacterItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CharacterItem_characterId_equippedSlot_key" ON "CharacterItem"("characterId", "equippedSlot");
