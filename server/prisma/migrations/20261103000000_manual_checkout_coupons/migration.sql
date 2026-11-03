-- Review and apply once, after database isolation verification and backup.
-- No historical orders, allocations, redemptions or invoice snapshots are altered.
ALTER TABLE `Coupon` ADD COLUMN `showAtCheckout` BOOLEAN NOT NULL DEFAULT false;
-- Explicitly retire the old configuration. Structures remain for audit/history.
UPDATE `AutomaticDiscount` SET `enabled` = false WHERE `id` = 1;
-- Dedicated campaigns start INACTIVE. Admin must review and enable each coupon.
-- Never make an existing private coupon public or overwrite an existing campaign.
INSERT INTO `Coupon` (`id`, `code`, `type`, `value`, `minCart`, `showAtCheckout`, `isActive`, `updatedAt`)
SELECT 'checkout-offer-5', 'TOKRII5', 'percent', 5.00, 700.00, true, false, CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (SELECT 1 FROM `Coupon` WHERE `code` = 'TOKRII5' OR `id` = 'checkout-offer-5');
INSERT INTO `Coupon` (`id`, `code`, `type`, `value`, `minCart`, `showAtCheckout`, `isActive`, `updatedAt`)
SELECT 'checkout-offer-10', 'TOKRII10', 'percent', 10.00, 1100.00, true, false, CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (SELECT 1 FROM `Coupon` WHERE `code` = 'TOKRII10' OR `id` = 'checkout-offer-10');
INSERT INTO `Coupon` (`id`, `code`, `type`, `value`, `minCart`, `showAtCheckout`, `isActive`, `updatedAt`)
SELECT 'checkout-offer-15', 'TOKRII15', 'percent', 15.00, 1500.00, true, false, CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (SELECT 1 FROM `Coupon` WHERE `code` = 'TOKRII15' OR `id` = 'checkout-offer-15');
