import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "src/dtos/createOrder.dto";
import { OrderResponse } from "src/responses/order.response";

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
}