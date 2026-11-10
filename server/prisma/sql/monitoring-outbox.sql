-- Additive only. Apply explicitly to staging after approval; never at application startup.
CREATE TABLE IF NOT EXISTS `MonitoringOutbox` (
  `id` VARCHAR(36) NOT NULL,
  `destination` VARCHAR(64) NOT NULL,
  `category` VARCHAR(16) NOT NULL,
  `payload` JSON NOT NULL,
  `bytes` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deliveredAt` DATETIME(3) NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `leaseOwner` VARCHAR(36) NULL,
  `leaseUntil` DATETIME(3) NULL,
  `fileDate` VARCHAR(10) NULL,
  `lastError` VARCHAR(64) NULL,
  PRIMARY KEY (`id`),
  INDEX `MonitoringOutbox_destination_deliveredAt_nextAttemptAt_idx` (`destination`, `deliveredAt`, `nextAttemptAt`),
  INDEX `MonitoringOutbox_deliveredAt_createdAt_idx` (`deliveredAt`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `MonitoringOutboxBudget` (
  `id` INTEGER NOT NULL DEFAULT 1,
  `usedBytes` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO `MonitoringOutboxBudget` (`id`, `usedBytes`)
SELECT 1, COALESCE(SUM(`bytes`), 0) FROM `MonitoringOutbox`;
