/*
  Warnings:

  - You are about to drop the column `number` on the `Group` table. All the data in the column will be lost.
  - Added the required column `name` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "number",
ADD COLUMN     "name" TEXT NOT NULL;
