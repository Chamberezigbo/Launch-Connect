/*
  Warnings:

  - You are about to drop the column `companyRole` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Company` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleInCompany` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "companyRole",
DROP COLUMN "name",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "roleInCompany" TEXT NOT NULL;
