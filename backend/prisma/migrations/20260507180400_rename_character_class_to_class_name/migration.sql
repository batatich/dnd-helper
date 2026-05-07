/*
  Warnings:

  - You are about to drop the column `className` on the `Character` table. All the data in the column will be lost.
  - Added the required column `classMame` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "className",
ADD COLUMN     "classMame" TEXT NOT NULL,
ADD COLUMN     "deathSaveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deathSaveSuccesses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hitDiceDice" TEXT,
ADD COLUMN     "hitDiceTotal" INTEGER,
ADD COLUMN     "hitDiceUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spellcastingAbility" TEXT;

-- AlterTable
ALTER TABLE "CharacterSpell" ADD COLUMN     "concentration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ritual" BOOLEAN NOT NULL DEFAULT false;
