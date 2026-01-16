import { Module } from "@nestjs/common";
import { InventoryItemController } from "./invertory-item.controller";
import { InventoryItemService } from "./inventory-item.service";
import { InventoryItemByIdPipe } from "src/common/pipes/inventory-item-by-id.pipe";

@Module({
    controllers: [InventoryItemController],
    providers: [InventoryItemService, InventoryItemByIdPipe],
})
export class InventoryItemModule {}