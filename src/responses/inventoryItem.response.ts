import { ApiProperty } from "@nestjs/swagger";

export class InventoryItemResponse {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    sku: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    unit: string;
}