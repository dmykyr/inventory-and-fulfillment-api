import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsPositive, ValidateNested } from "class-validator";

export class CreateOrderItemDto {
    @ApiProperty()
    @IsInt({ message: 'itemId must be an integer' })
    itemId: number;

    @ApiProperty()
    @IsInt({ message: 'quantity must be an integer' })
    @IsPositive({ message: 'quantity must be a positive number' })
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty()
    @IsInt({ message: 'orderNumber must be an integer' })
    orderNumber: number;

    @ApiProperty({ type: [CreateOrderItemDto] })
    @IsArray({ message: 'orderItems must be an array' })
    @ArrayNotEmpty({ message: 'orderItems must not be empty' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    orderItems: CreateOrderItemDto[];
}