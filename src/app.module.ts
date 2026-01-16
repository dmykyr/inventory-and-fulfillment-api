import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { InventoryItemModule } from './api/inventory-item/inventory-item.module';
import { OrderModule } from './api/order/order.module';
import { HealthCheckModule } from './api/healthcheck/healthcheck.module';

@Module({
  imports: [PrismaModule, InventoryItemModule, OrderModule, HealthCheckModule],
})
export class AppModule {}
