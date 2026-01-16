import { Order, OrderItem } from "@prisma/client";
import { OrderItemResponse, OrderResponse } from "src/responses/order.response";

export class OrderMapper {
    public static toOrderResponse(order: Order, orderItems: OrderItem[]): OrderResponse {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            orderItems: orderItems.map(OrderMapper.toOrderItemResponse)
        }
    }

    public static toOrderItemResponse(orderItem: OrderItem): OrderItemResponse {
        return {
            itemId: orderItem.itemId,
            quantity: orderItem.quantity
        }
    }
}