import { Test, TestingModule } from '@nestjs/testing';
import { InventoryItemService } from './inventory-item.service';
import { PrismaService } from 'src/database/prisma.service';
import { AppLoggerService } from 'src/common/services/app-logger.service';

describe('InventoryItemService', () => {
  let service: InventoryItemService;
  let prisma: jest.Mocked<PrismaService>;
  let logger: jest.Mocked<AppLoggerService>;

  const mockPrismaService = {
    inventoryItem: {
      create: jest.fn(),
    },
    inventoryStock: {
      upsert: jest.fn(),
    },
  };

  const mockLoggerService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryItemService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<InventoryItemService>(InventoryItemService);
    prisma = module.get(PrismaService);
    logger = module.get(AppLoggerService);

    jest.clearAllMocks();
  });

  describe('createInventoryItem', () => {
    const createDto = {
      name: 'Test Item',
      sku: 'TEST-SKU-001',
      type: 'electronics',
      unit: 'unit',
    };

    it('should create an inventory item successfully', async () => {
      const mockCreatedItem = {
        id: 1,
        ...createDto,
      };

      mockPrismaService.inventoryItem.create.mockResolvedValue(mockCreatedItem);

      const result = await service.createInventoryItem(createDto);

      expect(result).toEqual(mockCreatedItem);
      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'InventoryItemService',
          type: 'info',
          message: 'Inventory item created with Id: 1',
        }),
      );
    });

    it('should pass through Prisma errors', async () => {
      const prismaError = new Error('Unique constraint violation');
      mockPrismaService.inventoryItem.create.mockRejectedValue(prismaError);

      await expect(service.createInventoryItem(createDto)).rejects.toThrow(prismaError);
    });
  });

  describe('upsertInventoryItemStock', () => {
    const inventoryItem = { id: 1, name: 'Test Item', sku: 'TEST-001', type: 'electronics', unit: 'unit' };
    const addStockDto = {
      location: 'warehouse-A',
      quantity: 100,
    };

    it('should create new stock when it does not exist', async () => {
      const mockCreatedStock = {
        id: 1,
        inventoryItemId: 1,
        location: 'warehouse-A',
        quantity: 100,
      };

      mockPrismaService.inventoryStock.upsert.mockResolvedValue(mockCreatedStock);

      const result = await service.upsertInventoryItemStock(addStockDto, inventoryItem);

      expect(result).toEqual(mockCreatedStock);
      expect(mockPrismaService.inventoryStock.upsert).toHaveBeenCalledWith({
        where: {
          inventoryItemId_location: {
            inventoryItemId: 1,
            location: 'warehouse-A',
          },
        },
        update: { quantity: 100 },
        create: {
          inventoryItemId: 1,
          location: 'warehouse-A',
          quantity: 100,
        },
      });
    });

    it('should update existing stock quantity', async () => {
      const mockUpdatedStock = {
        id: 1,
        inventoryItemId: 1,
        location: 'warehouse-A',
        quantity: 150,
      };

      mockPrismaService.inventoryStock.upsert.mockResolvedValue(mockUpdatedStock);

      const result = await service.upsertInventoryItemStock(
        { location: 'warehouse-A', quantity: 150 },
        inventoryItem,
      );

      expect(result).toEqual(mockUpdatedStock);
    });

    it('should log stock update information', async () => {
      const mockStock = {
        id: 1,
        inventoryItemId: 1,
        location: 'warehouse-A',
        quantity: 100,
      };

      mockPrismaService.inventoryStock.upsert.mockResolvedValue(mockStock);

      await service.upsertInventoryItemStock(addStockDto, inventoryItem);

      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'InventoryItemService',
          type: 'info',
        }),
      );
    });

    it('should handle different locations for same item', async () => {
      const mockStockLocationB = {
        id: 2,
        inventoryItemId: 1,
        location: 'warehouse-B',
        quantity: 50,
      };

      mockPrismaService.inventoryStock.upsert.mockResolvedValue(mockStockLocationB);

      const result = await service.upsertInventoryItemStock(
        { location: 'warehouse-B', quantity: 50 },
        inventoryItem,
      );

      expect(result.location).toBe('warehouse-B');
      expect(mockPrismaService.inventoryStock.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            inventoryItemId_location: {
              inventoryItemId: 1,
              location: 'warehouse-B',
            },
          },
        }),
      );
    });

    it('should handle zero quantity', async () => {
      const mockZeroStock = {
        id: 1,
        inventoryItemId: 1,
        location: 'warehouse-A',
        quantity: 0,
      };

      mockPrismaService.inventoryStock.upsert.mockResolvedValue(mockZeroStock);

      const result = await service.upsertInventoryItemStock(
        { location: 'warehouse-A', quantity: 0 },
        inventoryItem,
      );

      expect(result.quantity).toBe(0);
    });
  });
});
