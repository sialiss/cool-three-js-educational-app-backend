/*
  Warnings:

  - Added the required column `size` to the `PracticeLesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PracticeLesson" ADD COLUMN     "size" JSONB NOT NULL;
