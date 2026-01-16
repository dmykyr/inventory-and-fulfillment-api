import { BadRequestException, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PrismaService } from 'src/database/prisma.service';
import { Order } from '@prisma/client';

@Injectable()
export class OrderByIdPipe implements PipeTransform<string, Promise<Order>> {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: string): Promise<Order> {
    if (!isUUID(value)) {
      throw new BadRequestException('Invalid order Id format');
    }
    
    const order = await this.prisma.order.findFirst({
      where: { id: value },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
