-- LeaveRequest tablosuna yeni kolonlar ekle
-- Bu scripti AWS üzerindeki phpMyAdmin'de lapd_mdt veritabanı seçiliyken çalıştırın

ALTER TABLE `LeaveRequest`
  ADD COLUMN `badge` VARCHAR(191) NOT NULL DEFAULT '' AFTER `officerId`,
  ADD COLUMN `fullName` VARCHAR(191) NOT NULL DEFAULT '' AFTER `badge`,
  ADD COLUMN `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `reason`,
  ADD COLUMN `endDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `startDate`,
  ADD COLUMN `dayCount` INT NOT NULL DEFAULT 1 AFTER `endDate`;
