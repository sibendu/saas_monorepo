-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('GOOGLE', 'GITHUB', 'DIRECT');

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "registrationType" "RegistrationType" NOT NULL DEFAULT 'DIRECT',

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);
