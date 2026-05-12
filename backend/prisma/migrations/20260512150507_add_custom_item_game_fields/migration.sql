-- AlterTable
ALTER TABLE "CharacterItem" ADD COLUMN     "allowedSlots" JSONB,
ADD COLUMN     "effects" JSONB,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "weaponConfig" JSONB;

-- AlterTable
ALTER TABLE "ItemTemplate" ADD COLUMN     "allowedSlots" JSONB,
ADD COLUMN     "weaponConfig" JSONB;
