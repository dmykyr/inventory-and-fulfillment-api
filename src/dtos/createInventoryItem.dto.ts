import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty()
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'sku must be a string' })
  @IsNotEmpty({ message: 'sku is required' })
  sku: string;

  @ApiProperty()
  @IsString({ message: 'type must be a string' })
  @IsNotEmpty({ message: 'type is required' })
  type: string;

  @ApiProperty()
  @IsString({ message: 'unit must be a string' })
  @IsNotEmpty({ message: 'unit is required' })
  unit: string;
}
