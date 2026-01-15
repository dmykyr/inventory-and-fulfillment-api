import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { InventoryItemModule } from './api/inventory-item/inventory-item.module';

@Module({
  imports: [PrismaModule, InventoryItemModule],
})
export class AppModule {}
