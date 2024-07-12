/*
  Warnings:

  - You are about to drop the `Data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Model` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Data" DROP CONSTRAINT "Data_modelId_fkey";

-- DropTable
DROP TABLE "Data";

-- DropTable
DROP TABLE "Model";

-- CreateTable
CREATE TABLE "CSVFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CSVFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSVData" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "price_fcst" INTEGER NOT NULL,
    "csvFileId" INTEGER NOT NULL,

    CONSTRAINT "CSVData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CSVFile_name_key" ON "CSVFile"("name");

-- AddForeignKey
ALTER TABLE "CSVData" ADD CONSTRAINT "CSVData_csvFileId_fkey" FOREIGN KEY ("csvFileId") REFERENCES "CSVFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
