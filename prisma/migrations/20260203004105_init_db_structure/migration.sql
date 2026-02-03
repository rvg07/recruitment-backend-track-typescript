-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `vat_number` VARCHAR(50) NOT NULL,
    `tax_code` VARCHAR(50) NULL,
    `address` VARCHAR(500) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `country` CHAR(2) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tax_profiles_vat_number_key`(`vat_number`),
    INDEX `tax_profiles_user_id_idx`(`user_id`),
    INDEX `tax_profiles_vat_number_idx`(`vat_number`),
    INDEX `tax_profiles_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_profile_id` INTEGER NOT NULL,
    `invoice_number` VARCHAR(50) NOT NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'EUR',
    `status` ENUM('DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE') NOT NULL DEFAULT 'DRAFT',
    `description` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    INDEX `invoices_tax_profile_id_idx`(`tax_profile_id`),
    INDEX `invoices_status_idx`(`status`),
    INDEX `invoices_issue_date_idx`(`issue_date`),
    INDEX `invoices_invoice_number_idx`(`invoice_number`),
    INDEX `invoices_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tax_profiles` ADD CONSTRAINT `tax_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_tax_profile_id_fkey` FOREIGN KEY (`tax_profile_id`) REFERENCES `tax_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
