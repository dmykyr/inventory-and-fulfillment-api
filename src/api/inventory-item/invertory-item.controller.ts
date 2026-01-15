import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';
import { CreateInventoryItemDto } from '../../dtos/createInventoryItem.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { InventoryItemResponse } from 'src/responses/inventoryItem.response';
import { AddInventoryItemStockDto } from 'src/dtos/addInventoryItemStock.dto';

@Controller('/inventory-items')
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}

  @Post()
  @ApiOkResponse({type: InventoryItemResponse})
  public async createInventoryItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryItemService.createInventoryItem(dto);
  }

  @Patch(':itemId/stocks')
  @ApiOkResponse({type: InventoryItemResponse})
  public async upsertInventoryItemStock(
    @Body() dto: AddInventoryItemStockDto, 
    @Param('itemId', new ParseIntPipe())  itemId: number
  ) {
    return this.inventoryItemService.upsertInventoryItemStock(dto, itemId);
  } 
}
