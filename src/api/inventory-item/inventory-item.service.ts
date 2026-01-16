import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateInventoryItemDto } from '../../dtos/createInventoryItem.dto';
import { AddInventoryItemStockDto } from 'src/dtos/addInventoryItemStock.dto';
import { InventoryItem } from '@prisma/client';
import { InventoryItemResponse } from 'src/responses/inventoryItem.response';
import { InventoryItemStockResponse } from 'src/responses/inventory-item-stock.response';
import { AppLoggerService } from 'src/common/services/app-logger.service';

@Injectable()
export class InventoryItemService {
  constructor(
    private prisma: PrismaService,
    private logger: AppLoggerService,
  ) {}

  public async createInventoryItem(dto: CreateInventoryItemDto): Promise<InventoryItemResponse> {

    const item = await this.prisma.inventoryItem.create({
      data: dto,
    });

    this.logger.log({
      timestamp: new Date().toISOString(),
      context: InventoryItemService.name,
      type: 'info',
      message: `Inventory item created with Id: ${item.id}`,
    });

    return item;
  }

  public async upsertInventoryItemStock(
    dto: AddInventoryItemStockDto, 
    inventoryItem: InventoryItem
  ): Promise<InventoryItemStockResponse> {
    const res = await this.prisma.inventoryStock.upsert({
      where: {
        inventoryItemId_location: {
          inventoryItemId: inventoryItem.id,
          location: dto.location,
        },
      },
      update: { quantity: dto.quantity },
      create: {
        inventoryItemId: inventoryItem.id,
        location: dto.location,
        quantity: dto.quantity,
      },
    });

    this.logger.log({
      timestamp: new Date().toISOString(),
      context: InventoryItemService.name,
      type: 'info',
      message: `
        Updated inventory item stock with Id: ${res.id} 
        at location: ${res.location} 
        with quantity: ${res.quantity}
      `,
    });
    return res;
  }
}
