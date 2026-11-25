ALTER TABLE `Order`
  ADD COLUMN `checkoutAttemptId` VARCHAR(80) NULL,
  ADD COLUMN `checkoutFingerprint` CHAR(64) NULL,
  ADD COLUMN `checkoutSnapshot` JSON NULL,
  ADD COLUMN `codConfirmedAt` DATETIME(3) NULL,
  ADD COLUMN `inventoryReservedAt` DATETIME(3) NULL,
  ADD COLUMN `inventoryReleasedAt` DATETIME(3) NULL,
  ADD UNIQUE KEY `Order_customerId_checkoutAttemptId_key` (`customerId`, `checkoutAttemptId`),
  ADD INDEX `Order_customerId_checkoutFingerprint_createdAt_idx` (`customerId`, `checkoutFingerprint`, `createdAt`),
  ADD INDEX `Order_inventoryReleasedAt_inventoryReservedAt_idx` (`inventoryReleasedAt`, `inventoryReservedAt`);

ALTER TABLE `Cart` ADD COLUMN `revision` INTEGER NOT NULL DEFAULT 0;
