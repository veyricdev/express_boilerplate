-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NULL,
    `type` ENUM('TEXT', 'BOOLEAN', 'IMAGE', 'JSON') NOT NULL DEFAULT 'TEXT',
    `group` ENUM('GENERAL', 'SEO', 'SOCIAL') NOT NULL DEFAULT 'GENERAL',
    `label` VARCHAR(150) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    INDEX `settings_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
