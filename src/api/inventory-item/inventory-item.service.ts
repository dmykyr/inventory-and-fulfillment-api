import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateInventoryItemDto } from '../../dtos/createInventoryItem.dto';

@Injectable()
export class InventoryItemService {
  constructor(private prisma: PrismaService) {}

  createInventoryItem(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: dto,
    });
  }
}
