-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Jan 10, 2025 at 11:54 PM
-- Server version: 8.0.36
-- PHP Version: 8.2.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_GeckoBot`
--
CREATE DATABASE IF NOT EXISTS `db_GeckoBot` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `db_GeckoBot`;

CREATE TABLE `tbl_Test` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `channelId` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NOT NULL,
  `message` TEXT NOT NULL,
  `remindAt` DATETIME NOT NULL,
  `repeatInterval` BIGINT UNSIGNED NULL COMMENT 'milliseconds between repeats',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_remind` (`userId`, `remindAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `tbl_Releases`
--

CREATE TABLE `tbl_Releases` (
  `release_id` int NOT NULL,
  `release_name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `release_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `release_date_sort` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_Reminders`
--

CREATE TABLE `tbl_Reminders` (
  `reminder_id` int NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `reminder` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `start_time` bigint NOT NULL,
  `recurrence_time` bigint NOT NULL,
  `end_duration` bigint NOT NULL,
  `channel_in` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_recurring` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=COMPACT;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_Releases`
--
ALTER TABLE `tbl_Releases`
  ADD PRIMARY KEY (`release_id`);

--
-- Indexes for table `tbl_Reminders`
--
ALTER TABLE `tbl_Reminders`
  ADD PRIMARY KEY (`reminder_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_Releases`
--
ALTER TABLE `tbl_Releases`
  MODIFY `release_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `tbl_Reminders`
--
ALTER TABLE `tbl_Reminders`
  MODIFY `reminder_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5059;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
