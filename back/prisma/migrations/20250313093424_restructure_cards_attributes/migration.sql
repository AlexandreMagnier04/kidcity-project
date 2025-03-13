/*
  Warnings:

  - You are about to drop the `Attribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardAttribute` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `background` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expression` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hair` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CardAttribute` DROP FOREIGN KEY `CardAttribute_attributeId_fkey`;

-- DropForeignKey
ALTER TABLE `CardAttribute` DROP FOREIGN KEY `CardAttribute_cardId_fkey`;

-- AlterTable
ALTER TABLE `Card` ADD COLUMN `background` VARCHAR(191) NOT NULL,
    ADD COLUMN `expression` VARCHAR(191) NOT NULL,
    ADD COLUMN `extra` VARCHAR(191) NULL,
    ADD COLUMN `hair` VARCHAR(191) NOT NULL,
    ADD COLUMN `hat` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Attribute`;

-- DropTable
DROP TABLE `CardAttribute`;

-- CreateTable
CREATE TABLE `Backgrounds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trait_type` VARCHAR(255) NOT NULL,
    `rarity` DECIMAL(5, 2) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
