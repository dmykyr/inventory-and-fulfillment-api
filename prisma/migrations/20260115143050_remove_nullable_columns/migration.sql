/*
  Warnings:

  - Made the column `name` on table `inventory_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sku` on table `inventory_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `inventory_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unit` on table `inventory_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `inventory_stocks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "inventory_items" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "unit" SET NOT NULL;

-- AlterTable
ALTER TABLE "inventory_stocks" ALTER COLUMN "location" SET NOT NULL;
