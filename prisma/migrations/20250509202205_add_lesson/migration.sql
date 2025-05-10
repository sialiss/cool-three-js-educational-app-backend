/*
  Warnings:

  - You are about to drop the column `description` on the `PracticeLesson` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `PracticeLesson` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TheoryLesson` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `TheoryLesson` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lessonId]` on the table `PracticeLesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lessonId]` on the table `TheoryLesson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonId` to the `PracticeLesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonId` to the `TheoryLesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PracticeLesson" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "lessonId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TheoryLesson" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "lessonId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeLesson_lessonId_key" ON "PracticeLesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "TheoryLesson_lessonId_key" ON "TheoryLesson"("lessonId");

-- AddForeignKey
ALTER TABLE "TheoryLesson" ADD CONSTRAINT "TheoryLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeLesson" ADD CONSTRAINT "PracticeLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
