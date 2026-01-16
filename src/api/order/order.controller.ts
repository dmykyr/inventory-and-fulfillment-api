import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "src/dtos/createOrder.dto";
import { OrderResponse } from "src/responses/order.response";
import { OrderByIdPipe } from "src/common/pipes/order-by-id.pipe";
import { Order } from "@prisma/client";

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOkResponse({ type: OrderResponse })
  @ApiBadRequestResponse()
  async createOrder(
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(dto);
  }

  @Post(':orderId/fulfill')
  @ApiOkResponse({ type: OrderResponse })
  @ApiBadRequestResponse()
  async fulfillOrder(
    @Param('orderId', OrderByIdPipe) order: Order,
  ) {
    return this.orderService.fulfillOrder(order);
  }
}