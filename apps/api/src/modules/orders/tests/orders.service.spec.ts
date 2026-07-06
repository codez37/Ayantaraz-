import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../orders.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockTx = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    course: { findUnique: jest.fn() },
    order: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    enrollment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: { create: jest.fn() },
  };

  const mockPrisma = {
    ...mockTx,
    $transaction: jest.fn((fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
  };

  const mockUser = {
    id: 1,
    phone: '09120000001',
    firstName: 'John',
    lastName: 'Doe',
  };
  const mockCourse = {
    id: 1,
    title: 'Test Course',
    price: 500000,
    status: 'published',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
  });

  describe('create', () => {
    it('should create order for authenticated user', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.order.count.mockResolvedValue(0);
      mockPrisma.order.create.mockResolvedValue({
        id: 1,
        status: 'pending',
        userId: 1,
      });

      const result = await service.create({ courseId: 1 }, 1);
      expect(result.status).toBe('pending');
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it('should create order for unauthenticated user with phone', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.order.count.mockResolvedValue(0);
      mockPrisma.order.create.mockResolvedValue({
        id: 1,
        status: 'pending',
        userId: 1,
      });

      const result = await service.create({
        courseId: 1,
        phoneNumber: '09120000001',
      });
      expect(result.status).toBe('pending');
    });

    it('should reject duplicate order within 30 min', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 99,
        status: 'pending',
      });

      await expect(service.create({ courseId: 1 }, 1)).rejects.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('should transition pending → waiting_for_call', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1,
        status: 'pending',
        userId: 1,
        itemId: 1,
        itemType: 'course',
      });
      mockPrisma.order.update.mockResolvedValue({
        id: 1,
        status: 'waiting_for_call',
      });

      const result = await service.updateStatus(
        1,
        { status: 'waiting_for_call' },
        1,
        'admin',
      );
      expect(result.status).toBe('waiting_for_call');
    });

    it('should create enrollment on confirm', async () => {
      const existingOrder = {
        id: 1,
        status: 'waiting_for_payment',
        userId: 1,
        itemId: 1,
        itemType: 'course',
        internalNotes: '',
      };
      mockPrisma.order.findUnique.mockResolvedValue(existingOrder);
      mockPrisma.order.update.mockResolvedValue({
        ...existingOrder,
        status: 'confirmed',
      });
      mockPrisma.enrollment.findFirst.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({ id: 1 });

      await service.updateStatus(
        1,
        { status: 'confirmed', paymentReference: 'TRX123' },
        1,
        'admin',
      );
      expect(mockPrisma.enrollment.create).toHaveBeenCalled();
    });

    it('should require payment reference for confirm', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1,
        status: 'waiting_for_payment',
        userId: 1,
        itemId: 1,
        itemType: 'course',
      });
      await expect(
        service.updateStatus(1, { status: 'confirmed' }, 1, 'admin'),
      ).rejects.toThrow();
    });

    it('should deactivate enrollment on refund', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1,
        status: 'confirmed',
        userId: 1,
        itemId: 1,
        itemType: 'course',
      });
      mockPrisma.order.update.mockResolvedValue({ id: 1, status: 'refunded' });
      mockPrisma.enrollment.updateMany.mockResolvedValue({ count: 1 });

      await service.updateStatus(1, { status: 'refunded' }, 1, 'admin');
      expect(mockPrisma.enrollment.updateMany).toHaveBeenCalled();
    });
  });

  describe('cancelByUser', () => {
    it('should allow user to cancel pending order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 1,
        status: 'pending',
        userId: 1,
      });
      mockPrisma.order.update.mockResolvedValue({ id: 1, status: 'canceled' });

      const result = await service.cancelByUser(1, 1);
      expect(result.status).toBe('canceled');
    });

    it('should reject cancel for non-pending order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 1,
        status: 'confirmed',
        userId: 1,
      });
      await expect(service.cancelByUser(1, 1)).rejects.toThrow();
    });
  });
});
