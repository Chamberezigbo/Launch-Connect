/*
  Warnings:

  - You are about to drop the column `salary` on the `Job` table. All the data in the column will be lost.
  - Added the required column `commitmenLevel` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industry` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidRole` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibilities` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaidRole" AS ENUM ('UNPAID', 'PAID');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "salary",
ADD COLUMN     "commitmenLevel" TEXT NOT NULL,
ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "industry" TEXT NOT NULL,
ADD COLUMN     "paidRole" "PaidRole" NOT NULL,
ADD COLUMN     "responsibilities" TEXT NOT NULL,
ALTER COLUMN "skillsRequired" SET NOT NULL,
ALTER COLUMN "skillsRequired" SET DATA TYPE TEXT;
