import { Body, Controller, Post } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "src/dtos/createOrder.dto";

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(dto);
  }
}