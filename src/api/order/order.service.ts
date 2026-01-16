import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { CreateOrderDto } from "src/dtos/createOrder.dto";
import { OrderMapper } from "./order.mapper";
import { AppLoggerService } from "src/common/services/app-logger.service";
import { InventoryItem, InventoryStock, Order, OrderItem, OrderStatus } from "@prisma/client";

@Injectable()
export class OrderService {
  private readonly lowStockQuantity = 5;
  private readonly criticalStockQuantity = 2;
  private readonly triggerThreshold = [
      { limit: this.criticalStockQuantity, level: 'critical', type: 'CRITICAL_STOCK_QUANTITY'},
      { limit: this.lowStockQuantity, level: 'low', type: 'LOW_STOCK_QUANTITY'}, 
  ];

  constructor(
    private prisma: PrismaService,
    private logger: AppLoggerService,
  ) {}

  public async createOrder(dto: CreateOrderDto) {
    await this.validateOrderItems(dto.orderItems.map(item => item.itemId));
    await this.validateItemsStockExistance(dto.orderItems.map(item => item.itemId), dto.stockLocation);

    const { order, createdOrderItems } = await this.prisma.$transaction(async (prisma) => {
        const order = await prisma.order.create({
            data: {
              orderNumber: dto.orderNumber,
              stockLocation: dto.stockLocation,
            },
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
  private async validateItemsStockExistance(itemIds: number[], stockLocation: string) {
    const items = await this.prisma.inventoryStock.findMany({
      where: {
        id: { in: itemIds },
        location: stockLocation,
      },
    });

    if (items.length !== itemIds.length) {
      throw new BadRequestException("Some order items do not exist in the specified stock location");
    }
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

  public async fulfillOrder(order: Order) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: order.id },
    });

    const stockAlerts: Array<StockQuantityAlertDto> = [];

    await this.prisma.$transaction(async (prisma) => {
      for (const orderItem of orderItems) {
        const itemStock = await prisma.inventoryStock.findUnique({
          where: {
            inventoryItemId_location: {
              inventoryItemId: orderItem.itemId,
              location: order.stockLocation,
            },
          },
        });

        this.validateItemStockQuantity(itemStock, orderItem);

        const remainingQuantity = itemStock.quantity - orderItem.quantity;

        await prisma.inventoryStock.update({
          where: { id: itemStock.id },
          data: {
            quantity: { decrement: orderItem.quantity },
          },
        });

        const threshold = this.triggerThreshold.find(t => remainingQuantity <= t.limit);
        if (threshold) {
          stockAlerts.push({
            itemId: orderItem.itemId,
            level: threshold.level,
            type: threshold.type,
            location: itemStock.location,
            remainingQuantity,
          });
        }
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FULFILLED },
      });
    });

    for (const alert of stockAlerts) {
      this.logger.log({
        timestamp: new Date().toISOString(),
        context: OrderService.name,
        type: alert.type,
        message: `Item ${alert.itemId} has ${alert.level} stock quantity at ${alert.location}, remaining quantity: ${alert.remainingQuantity}.`,
      });
    }
  }

  private validateItemStockQuantity(itemStock: InventoryStock, orderItem: OrderItem) {
    if (!itemStock) {
      throw new BadRequestException(`Item ${orderItem.itemId} not found in stock location ${itemStock.location}`);
    }

    if (itemStock.quantity < orderItem.quantity) {
      throw new BadRequestException(`Item ${orderItem.itemId} stock in ${itemStock.location} is not enough for fulfillment`);
    }
  }
}

class StockQuantityAlertDto {
  itemId: number; 
  level: string; 
  type: string; 
  location: string; 
  remainingQuantity: number
}