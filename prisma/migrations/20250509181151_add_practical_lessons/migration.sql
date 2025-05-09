-- CreateTable
CREATE TABLE "PracticalLesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "field" JSONB NOT NULL,
    "extras" JSONB NOT NULL,
    "goal" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticalLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompletedPracticalLessons" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CompletedPracticalLessons_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CompletedPracticalLessons_B_index" ON "_CompletedPracticalLessons"("B");

-- AddForeignKey
ALTER TABLE "_CompletedPracticalLessons" ADD CONSTRAINT "_CompletedPracticalLessons_A_fkey" FOREIGN KEY ("A") REFERENCES "PracticalLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompletedPracticalLessons" ADD CONSTRAINT "_CompletedPracticalLessons_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
