-- AlterTable
ALTER TABLE `categories` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `tags` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `categories_deleted_at_idx` ON `categories`(`deleted_at`);

-- CreateIndex
CREATE INDEX `posts_deleted_at_idx` ON `posts`(`deleted_at`);

-- CreateIndex
CREATE INDEX `tags_deleted_at_idx` ON `tags`(`deleted_at`);

-- CreateIndex
CREATE INDEX `users_deleted_at_idx` ON `users`(`deleted_at`);
