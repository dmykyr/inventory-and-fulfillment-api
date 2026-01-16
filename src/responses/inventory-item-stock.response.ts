import { ApiProperty } from "@nestjs/swagger";

export class InventoryItemStockResponse {
    @ApiProperty()
    inventoryItemId: number;
    @ApiProperty()
    location: string;
    @ApiProperty()
    quantity: number;
}