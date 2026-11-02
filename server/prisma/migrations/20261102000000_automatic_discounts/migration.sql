-- Additive migration: historical totals are never recalculated.
CREATE TABLE `AutomaticDiscount` (
  `id` INTEGER NOT NULL DEFAULT 1,
  `enabled` BOOLEAN NOT NULL DEFAULT false,
  `tiers` JSON NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `Order` ADD COLUMN `automaticDiscount` JSON NULL;
ALTER TABLE `OrderItem` ADD COLUMN `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00;
-- Initial data only. Application code never falls back to these thresholds.
INSERT INTO `AutomaticDiscount` (`id`, `enabled`, `tiers`) VALUES
(1, false, '[{"id":"initial-1","minimum":700,"percentage":5,"active":true},{"id":"initial-2","minimum":1100,"percentage":10,"active":true},{"id":"initial-3","minimum":1500,"percentage":15,"active":true}]');
