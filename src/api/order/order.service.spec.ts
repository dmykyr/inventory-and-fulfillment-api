import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from 'src/database/prisma.service';
import { AppLoggerService } from 'src/common/services/app-logger.service';
import { OrderStatus } from '@prisma/client';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: jest.Mocked<PrismaService>;
  let logger: jest.Mocked<AppLoggerService>;

  const mockPrismaService = {
    inventoryItem: {
      findMany: jest.fn(),
    },
    inventoryStock: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      createManyAndReturn: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get(PrismaService);
    logger = module.get(AppLoggerService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderDto = {
      orderNumber: 1001,
      stockLocation: 'warehouse-A',
      orderItems: [
        { itemId: 1, quantity: 5 },
        { itemId: 2, quantity: 3 },
      ],
    };

    it('should create an order successfully', async () => {
      const mockOrder = { id: 'order-uuid', orderNumber: 1001, status: OrderStatus.PENDING };
      const mockOrderItems = [
        { orderId: 'order-uuid', itemId: 1, quantity: 5 },
        { orderId: 'order-uuid', itemId: 2, quantity: 3 },
      ];

      mockPrismaService.inventoryItem.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrismaService.inventoryStock.findMany.mockResolvedValue([
        { inventoryItemId: 1, location: 'warehouse-A' },
        { inventoryItemId: 2, location: 'warehouse-A' },
      ]);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txPrisma = {
          order: { create: jest.fn().mockResolvedValue(mockOrder) },
          orderItem: { createManyAndReturn: jest.fn().mockResolvedValue(mockOrderItems) },
        };
        return cb(txPrisma);
      });

      const result = await service.createOrder(createOrderDto);

      expect(result).toEqual({
        id: 'order-uuid',
        orderNumber: 1001,
        status: OrderStatus.PENDING,
        orderItems: [
          { itemId: 1, quantity: 5 },
          { itemId: 2, quantity: 3 },
        ],
      });
      expect(logger.log).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when duplicate items provided', async () => {
      const dtoWithDuplicates = {
        ...createOrderDto,
        orderItems: [
          { itemId: 1, quantity: 5 },
          { itemId: 1, quantity: 3 },
        ],
      };

      await expect(service.createOrder(dtoWithDuplicates)).rejects.toThrow(
        new BadRequestException('Duplicate items are not allowed'),
      );
    });

    it('should throw BadRequestException when some items do not exist', async () => {
      mockPrismaService.inventoryItem.findMany.mockResolvedValue([{ id: 1 }]);

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        new BadRequestException('Some order items do not exist'),
      );
    });

    it('should throw BadRequestException when items not in stock location', async () => {
      mockPrismaService.inventoryItem.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrismaService.inventoryStock.findMany.mockResolvedValue([
        { inventoryItemId: 1, location: 'warehouse-A' },
      ]);

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        new BadRequestException('Some order items do not exist in the specified stock location'),
      );
    });
  });

  describe('fulfillOrder', () => {
    const mockOrder = { id: 'order-uuid', orderNumber: 1001, status: OrderStatus.PENDING };

    it('should fulfill an order successfully', async () => {
      const mockOrderItems = [{ orderId: 'order-uuid', itemId: 1, quantity: 5 }];
      const mockInventoryStock = { id: 1, inventoryItemId: 1, location: 'warehouse-A', quantity: 10 };

      mockPrismaService.orderItem.findMany.mockResolvedValue(mockOrderItems);
      mockPrismaService.inventoryStock.findFirst.mockResolvedValue(mockInventoryStock);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txPrisma = {
          inventoryStock: {
            findUnique: jest.fn().mockResolvedValue(mockInventoryStock),
            update: jest.fn().mockResolvedValue({ ...mockInventoryStock, quantity: 5 }),
          },
          order: { update: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.FULFILLED }) },
        };
        return cb(txPrisma);
      });

      await service.fulfillOrder(mockOrder);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const mockOrderItems = [{ orderId: 'order-uuid', itemId: 1, quantity: 15 }];
      const mockInventoryStock = { id: 1, inventoryItemId: 1, location: 'warehouse-A', quantity: 10 };

      mockPrismaService.orderItem.findMany.mockResolvedValue(mockOrderItems);
      mockPrismaService.inventoryStock.findFirst.mockResolvedValue(mockInventoryStock);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txPrisma = {
          inventoryStock: {
            findUnique: jest.fn().mockResolvedValue(mockInventoryStock),
          },
        };
        return cb(txPrisma);
      });

      await expect(service.fulfillOrder(mockOrder)).rejects.toThrow(BadRequestException);
    });

    it('should log critical stock alert when remaining quantity is 2 or less', async () => {
      const mockOrderItems = [{ orderId: 'order-uuid', itemId: 1, quantity: 8 }];
      const mockInventoryStock = { id: 1, inventoryItemId: 1, location: 'warehouse-A', quantity: 10 };

      mockPrismaService.orderItem.findMany.mockResolvedValue(mockOrderItems);
      mockPrismaService.inventoryStock.findFirst.mockResolvedValue(mockInventoryStock);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txPrisma = {
          inventoryStock: {
            findUnique: jest.fn().mockResolvedValue(mockInventoryStock),
            update: jest.fn().mockResolvedValue({ ...mockInventoryStock, quantity: 2 }),
          },
          order: { update: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.FULFILLED }) },
        };
        return cb(txPrisma);
      });

      await service.fulfillOrder(mockOrder);

      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CRITICAL_STOCK_QUANTITY',
        }),
      );
    });

    it('should log low stock alert when remaining quantity is 5 or less', async () => {
      const mockOrderItems = [{ orderId: 'order-uuid', itemId: 1, quantity: 6 }];
      const mockInventoryStock = { id: 1, inventoryItemId: 1, location: 'warehouse-A', quantity: 10 };

      mockPrismaService.orderItem.findMany.mockResolvedValue(mockOrderItems);
      mockPrismaService.inventoryStock.findFirst.mockResolvedValue(mockInventoryStock);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txPrisma = {
          inventoryStock: {
            findUnique: jest.fn().mockResolvedValue(mockInventoryStock),
            update: jest.fn().mockResolvedValue({ ...mockInventoryStock, quantity: 4 }),
          },
          order: { update: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.FULFILLED }) },
        };
        return cb(txPrisma);
      });

      await service.fulfillOrder(mockOrder);

      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'LOW_STOCK_QUANTITY',
        }),
      );
    });

    it('should not log alert when remaining quantity is above threshold', async () => {
      const mockOrderItems = [{ orderId: 'order-uuid', itemId: 1, quantity: 2 }];
      const mockInventoryStock = { id: 1, inventoryItemId: 1, location: 'warehouse-A', quantity: 10 };

      mockPrismaService.orderItem.findMany.mockResolvedValue(mockOrderItems);
      mockPrismaService.inventoryStock.findFirst.mockResolvedValue(mockInventoryStock);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txPrisma = {
          inventoryStock: {
            findUnique: jest.fn().mockResolvedValue(mockInventoryStock),
            update: jest.fn().mockResolvedValue({ ...mockInventoryStock, quantity: 8 }),
          },
          order: { update: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.FULFILLED }) },
        };
        return cb(txPrisma);
      });

      await service.fulfillOrder(mockOrder);

      expect(logger.log).not.toHaveBeenCalled();
    });
  });
});
