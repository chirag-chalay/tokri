ALTER TABLE `Order` ADD COLUMN `trackingContext` JSON NULL;
CREATE TABLE `TrackingDelivery` (
  `id` VARCHAR(191) NOT NULL,
  `sessionId` VARCHAR(191) NULL,
  `pixelId` VARCHAR(191) NOT NULL,
  `payload` JSON NOT NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `sentAt` DATETIME(3) NULL,
  `leaseUntil` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `TrackingDelivery_sessionId_idx` (`sessionId`),
  INDEX `TrackingDelivery_sentAt_nextAttemptAt_idx` (`sentAt`, `nextAttemptAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
