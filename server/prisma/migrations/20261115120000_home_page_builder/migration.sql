-- CreateTable
CREATE TABLE `HomeLayout` (
    `id` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(16) NOT NULL,
    `draft` JSON NOT NULL,
    `published` JSON NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `publishedAt` DATETIME(3) NULL,
    `publishedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HomeLayout_platform_key`(`platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeLayoutRevision` (
    `id` VARCHAR(191) NOT NULL,
    `layoutId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `document` JSON NOT NULL,
    `publishedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HomeLayoutRevision_layoutId_createdAt_idx`(`layoutId`, `createdAt`),
    UNIQUE INDEX `HomeLayoutRevision_layoutId_version_key`(`layoutId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HomeLayoutRevision` ADD CONSTRAINT `HomeLayoutRevision_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `HomeLayout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
