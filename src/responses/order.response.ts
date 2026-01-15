import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";

export class OrderItemResponse {
    @ApiProperty()
    itemId: number;
    @ApiProperty()
    quantity: number;
}


export class OrderResponse {
    @ApiProperty()
    id: string;
    @ApiProperty()
    orderNumber: number;
    @ApiProperty()
    status: OrderStatus;
    @ApiProperty({ type: [OrderItemResponse] })
    orderItems: OrderItemResponse[];
}