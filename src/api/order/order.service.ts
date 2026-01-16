import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { CreateOrderDto } from "src/dtos/createOrder.dto";
import { OrderMapper } from "./order.mapper";
import { AppLoggerService } from "src/common/services/app-logger.service";

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private logger: AppLoggerService,
  ) {}

  public async createOrder(dto: CreateOrderDto) {
    await this.validateOrderItems(dto.orderItems.map(item => item.itemId));

    const { order, createdOrderItems } = await this.prisma.$transaction(async (prisma) => {
        const order = await prisma.order.create({
            data: { orderNumber: dto.orderNumber },
        });

        const createdOrderItems = await prisma.orderItem.createManyAndReturn({
            data: dto.orderItems.map(item => ({
                orderId: order.id,
                itemId: item.itemId,
                quantity: item.quantity,
            })),
        });

        return { order, createdOrderItems };
    });

    for (const item of createdOrderItems) {
      this.logger.log({
        timestamp: new Date().toISOString(),
        context: OrderService.name,
        type: 'ITEM_RESERVED',
        message: `Item ${item.itemId} reserved for Order ${order.id}, Quantity: ${item.quantity}.`
      });
    } 
    
    return OrderMapper.toOrderResponse(order, createdOrderItems);
  }

  private async validateOrderItems(itemIds: number[]) {
    const uniqueItemIds = [...new Set(itemIds)];

    if (uniqueItemIds.length !== itemIds.length) {
      throw new BadRequestException("Duplicate items are not allowed");
    }

    const items = await this.prisma.inventoryItem.findMany({
      where: {
        id: { in: uniqueItemIds },
      },
    });

    if (items.length !== uniqueItemIds.length) {
      throw new BadRequestException("Some order items do not exist");
    }
  }
}