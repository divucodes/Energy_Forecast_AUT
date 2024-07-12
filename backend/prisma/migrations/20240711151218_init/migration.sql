/*
  Warnings:

  - You are about to drop the `CSVData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CSVData" DROP CONSTRAINT "CSVData_csvFileId_fkey";

-- DropIndex
DROP INDEX "CSVFile_name_key";

-- AlterTable
ALTER TABLE "CSVFile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "CSVData";

-- CreateTable
CREATE TABLE "CSVRow" (
    "id" SERIAL NOT NULL,
    "csvFileId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "priceFcst" DOUBLE PRECISION NOT NULL,
    "actualPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CSVRow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CSVRow" ADD CONSTRAINT "CSVRow_csvFileId_fkey" FOREIGN KEY ("csvFileId") REFERENCES "CSVFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
