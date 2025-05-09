/*
  Warnings:

  - You are about to drop the `PracticalLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CompletedPracticalLessons` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CompletedPracticalLessons" DROP CONSTRAINT "_CompletedPracticalLessons_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompletedPracticalLessons" DROP CONSTRAINT "_CompletedPracticalLessons_B_fkey";

-- DropTable
DROP TABLE "PracticalLesson";

-- DropTable
DROP TABLE "_CompletedPracticalLessons";

-- CreateTable
CREATE TABLE "PracticeLesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "field" JSONB NOT NULL,
    "extras" JSONB NOT NULL,
    "goal" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompletedPracticeLessons" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CompletedPracticeLessons_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CompletedPracticeLessons_B_index" ON "_CompletedPracticeLessons"("B");

-- AddForeignKey
ALTER TABLE "_CompletedPracticeLessons" ADD CONSTRAINT "_CompletedPracticeLessons_A_fkey" FOREIGN KEY ("A") REFERENCES "PracticeLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompletedPracticeLessons" ADD CONSTRAINT "_CompletedPracticeLessons_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
