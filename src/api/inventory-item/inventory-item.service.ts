import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateInventoryItemDto } from '../../dtos/createInventoryItem.dto';
import { AddInventoryItemStockDto } from 'src/dtos/addInventoryItemStock.dto';
import { InventoryItem } from '@prisma/client';

@Injectable()
export class InventoryItemService {
  constructor(private prisma: PrismaService) {}

  public async createInventoryItem(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: dto,
    });
  }

  public async upsertInventoryItemStock(dto: AddInventoryItemStockDto, inventoryItem: InventoryItem) {
    return this.prisma.inventoryStock.upsert({
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
  }
}
