import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { InventoryItemModule } from './api/inventory-item/inventory-item.module';
import { OrderModule } from './api/order/order.module';
import { HealthCheckModule } from './api/healthcheck/healthcheck.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    InventoryItemModule,
    OrderModule,
    HealthCheckModule,
  ],
})
export class AppModule {}
