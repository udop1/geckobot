CREATE DATABASE IF NOT EXISTS `db_GeckoBot` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `db_GeckoBot`;

CREATE TABLE IF NOT EXISTS `tbl_Reminders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `channelId` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NOT NULL,
  `message` TEXT NOT NULL,
  `remindAt` BIGINT UNSIGNED NOT NULL,
  `repeatInterval` BIGINT UNSIGNED NULL,
  `createdAt` BIGINT UNSIGNED NOT NULL,
  `messageUrl` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_user_remind` (`userId`, `remindAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;