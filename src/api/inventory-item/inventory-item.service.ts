import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateInventoryItemDto } from '../../dtos/createInventoryItem.dto';
import { AddInventoryItemStockDto } from 'src/dtos/addInventoryItemStock.dto';

@Injectable()
export class InventoryItemService {
  constructor(private prisma: PrismaService) {}

  public async createInventoryItem(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: dto,
    });
  }

  public async upsertInventoryItemStock(dto: AddInventoryItemStockDto, itemId: number) {
    const itemToStock = await this.prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
      },
    });

    if (!itemToStock) {
      throw new BadRequestException('Item with such id does not exist');
    }

    return this.prisma.inventoryStock.upsert({
      where: {
        inventoryItemId_location: {
          inventoryItemId: itemId,
          location: dto.location,
        },
      },
      update: { quantity: dto.quantity },
      create: {
        inventoryItemId: itemId,
        location: dto.location,
        quantity: dto.quantity,
      },
    });
  }
}
