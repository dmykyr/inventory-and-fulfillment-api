import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsPositive, ValidateNested } from "class-validator";

export class CreateOrderItemDto {
    @ApiProperty()
    @IsInt()
    itemId: number;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty()
    @IsInt()
    orderNumber: number;

    @ApiProperty({ type: [CreateOrderItemDto] })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    orderItems: CreateOrderItemDto[];
}