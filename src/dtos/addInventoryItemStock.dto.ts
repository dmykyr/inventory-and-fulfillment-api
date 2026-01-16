import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddInventoryItemStockDto {
    @ApiProperty()
    @IsString({ message: 'location must be a string' })
    @IsNotEmpty({ message: 'location is required' })
    location: string;

    @ApiProperty()
    @Type(() => Number)
    @IsInt({ message: 'quantity must be an integer' })
    @Min(0, { message: 'quantity must be a non-negative number' })
    @IsNotEmpty({ message: 'quantity is required' })
    quantity: number;
}