import { BadRequestException, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { InventoryItem } from '@prisma/client';

@Injectable()
export class InventoryItemByIdPipe implements PipeTransform<string, Promise<InventoryItem>> {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: string): Promise<InventoryItem> {
    const id = parseInt(value, 10);

    if (isNaN(id)) {
      throw new BadRequestException('Invalid inventory item id');
    }

    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: { id },
    });

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    return inventoryItem;
  }
}
