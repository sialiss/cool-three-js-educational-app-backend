/*
  Warnings:

  - Made the column `patronymic` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "patronymic" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateTable
CREATE TABLE "TheoryLesson" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoryLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompletedTheoryLessons" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CompletedTheoryLessons_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CompletedTheoryLessons_B_index" ON "_CompletedTheoryLessons"("B");

-- AddForeignKey
ALTER TABLE "_CompletedTheoryLessons" ADD CONSTRAINT "_CompletedTheoryLessons_A_fkey" FOREIGN KEY ("A") REFERENCES "TheoryLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompletedTheoryLessons" ADD CONSTRAINT "_CompletedTheoryLessons_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
