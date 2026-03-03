-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "task_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "owner" TEXT NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_task_id_key" ON "task"("task_id");
