/*
  Warnings:

  - Added the required column `storedFilename` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storedFilename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "duration" REAL,
    "waveformData" JSONB,
    "stemCount" INTEGER NOT NULL DEFAULT 0,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Track_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("createdAt", "duration", "fileSize", "fileType", "filename", "id", "name", "processedAt", "progress", "status", "stemCount", "updatedAt", "userId", "waveformData") SELECT "createdAt", "duration", "fileSize", "fileType", "filename", "id", "name", "processedAt", "progress", "status", "stemCount", "updatedAt", "userId", "waveformData" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE INDEX "Track_userId_idx" ON "Track"("userId");
CREATE INDEX "Track_status_idx" ON "Track"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
