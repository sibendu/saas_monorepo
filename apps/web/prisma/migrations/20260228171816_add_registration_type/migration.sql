/*
  Warnings:

  - You are about to drop the column `registrationType` on the `customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customer" DROP COLUMN "registrationType",
ADD COLUMN     "registration_type" "RegistrationType" NOT NULL DEFAULT 'DIRECT';
