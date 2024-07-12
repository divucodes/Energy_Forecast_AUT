/*
  Warnings:

  - Added the required column `province` to the `CSVData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CSVData" ADD COLUMN     "province" TEXT NOT NULL;
