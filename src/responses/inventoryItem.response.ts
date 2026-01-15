import { ApiProperty } from "@nestjs/swagger";

export class InventoryItemResponse {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    sku: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    unit: string;
}