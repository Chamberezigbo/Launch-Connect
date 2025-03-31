/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Company` table. All the data in the column will be lost.
  - Added the required column `companyRole` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `JobSeeker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "logoUrl",
ADD COLUMN     "companyRole" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobSeeker" ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "interests" TEXT;
