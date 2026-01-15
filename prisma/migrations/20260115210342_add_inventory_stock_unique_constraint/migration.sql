/*
  Warnings:

  - A unique constraint covering the columns `[item_id,location]` on the table `inventory_stocks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "inventory_stocks_item_id_location_key" ON "inventory_stocks"("item_id", "location");
