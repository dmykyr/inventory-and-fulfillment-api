import { Body, Controller, Post } from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';
import { CreateInventoryItemDto } from '../../dtos/createInventoryItem.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { InventoryItemResponse } from 'src/responses/inventoryItem.response';

@Controller('/inventory-items')
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}

  @Post()
  @ApiOkResponse({type: InventoryItemResponse})
  public async createInventoryItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryItemService.createInventoryItem(dto);
  }
}
