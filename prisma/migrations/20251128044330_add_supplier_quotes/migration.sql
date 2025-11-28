-- CreateTable
CREATE TABLE `supplier_quotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quoted_price_per_gram` DECIMAL(10, 4) NOT NULL,
    `minimum_order_grams` DECIMAL(8, 2) NULL,
    `estimated_quality_rating` TINYINT NULL,
    `quote_date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATE NULL,
    `status` ENUM('pending', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `converted_purchase_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `supplier_quotes_converted_purchase_id_key`(`converted_purchase_id`),
    INDEX `supplier_quotes_supplier_id_idx`(`supplier_id`),
    INDEX `supplier_quotes_product_id_idx`(`product_id`),
    INDEX `supplier_quotes_status_idx`(`status`),
    INDEX `supplier_quotes_quote_date_idx`(`quote_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `supplier_quotes` ADD CONSTRAINT `supplier_quotes_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_quotes` ADD CONSTRAINT `supplier_quotes_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_quotes` ADD CONSTRAINT `supplier_quotes_converted_purchase_id_fkey` FOREIGN KEY (`converted_purchase_id`) REFERENCES `inventory_purchases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
