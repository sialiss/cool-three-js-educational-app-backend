-- AlterTable
ALTER TABLE "User" ADD COLUMN     "groupId" INTEGER;

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupLessons" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupLessons_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AllowedLessons" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AllowedLessons_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupLessons_B_index" ON "_GroupLessons"("B");

-- CreateIndex
CREATE INDEX "_AllowedLessons_B_index" ON "_AllowedLessons"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupLessons" ADD CONSTRAINT "_GroupLessons_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupLessons" ADD CONSTRAINT "_GroupLessons_B_fkey" FOREIGN KEY ("B") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedLessons" ADD CONSTRAINT "_AllowedLessons_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedLessons" ADD CONSTRAINT "_AllowedLessons_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
