-- CreateTable
CREATE TABLE "CharacterHpIncrease" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "dice" TEXT NOT NULL,
    "rolledValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterHpIncrease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterHpIncrease_characterId_idx" ON "CharacterHpIncrease"("characterId");

-- AddForeignKey
ALTER TABLE "CharacterHpIncrease" ADD CONSTRAINT "CharacterHpIncrease_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
