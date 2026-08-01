/*
  Warnings:

  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_scraperId_fkey";

-- DropTable
DROP TABLE "Question";

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "rating" TEXT,
    "location" TEXT,
    "host" TEXT,
    "amenities" TEXT,
    "rawHtml" TEXT,
    "scraperId" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_sourceUrl_key" ON "Listing"("sourceUrl");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_scraperId_fkey" FOREIGN KEY ("scraperId") REFERENCES "ScraperRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
