import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationService } from '../consultation.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ConsultationService', () => {
  let service: ConsultationService;

  const mockTx = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    consultationRequest: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ConsultationService>(ConsultationService);
  });

  describe('create', () => {
    it('should create a consultation request', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.consultationRequest.findFirst.mockResolvedValue(null);
      mockPrisma.consultationRequest.count.mockResolvedValue(0);
      mockPrisma.consultationRequest.create.mockResolvedValue({
        id: 1,
        status: 'pending',
        userId: 1,
      });

      const result = await service.create(
        { subject: 'tax', message: 'I need help with taxes' },
        1,
      );
      expect(result.status).toBe('pending');
      expect(mockPrisma.consultationRequest.create).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should reject duplicate request within 5 min', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.consultationRequest.findFirst.mockResolvedValue({
        id: 99,
        status: 'pending',
      });

      await expect(
        service.create({ subject: 'tax', message: 'Need help' }, 1),
      ).rejects.toThrow();
    });

    it('should rate limit after 5 requests per hour', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.consultationRequest.findFirst.mockResolvedValue(null);
      mockPrisma.consultationRequest.count.mockResolvedValue(5);

      await expect(
        service.create({ subject: 'tax', message: 'Need help' }, 1),
      ).rejects.toThrow();
    });

    it('should create user for unauthenticated request', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.consultationRequest.findFirst.mockResolvedValue(null);
      mockPrisma.consultationRequest.count.mockResolvedValue(0);
      mockPrisma.consultationRequest.create.mockResolvedValue({
        id: 1,
        status: 'pending',
        userId: 1,
      });

      const result = await service.create({
        subject: 'tax',
        message: 'Need help',
        phoneNumber: '09120000001',
      });
      expect(result.status).toBe('pending');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should transition pending → contacted', async () => {
      mockPrisma.consultationRequest.findUnique.mockResolvedValue({
        id: 1,
        status: 'pending',
      });
      mockPrisma.consultationRequest.update.mockResolvedValue({
        id: 1,
        status: 'contacted',
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.updateStatus(
        1,
        { status: 'contacted' },
        1,
        'admin',
      );
      expect(result.status).toBe('contacted');
    });

    it('should reject invalid transitions', async () => {
      mockPrisma.consultationRequest.findUnique.mockResolvedValue({
        id: 1,
        status: 'completed',
      });
      await expect(
        service.updateStatus(1, { status: 'pending' }, 1, 'admin'),
      ).rejects.toThrow();
    });

    it('should set contactedAt on first contact', async () => {
      mockPrisma.consultationRequest.findUnique.mockResolvedValue({
        id: 1,
        status: 'pending',
        contactedAt: null,
      });
      mockPrisma.consultationRequest.update.mockResolvedValue({
        id: 1,
        status: 'contacted',
        contactedAt: new Date(),
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.updateStatus(
        1,
        { status: 'contacted' },
        1,
        'admin',
      );
      expect(result.contactedAt).toBeTruthy();
    });

    it('should add internal notes when provided', async () => {
      const existing = { id: 1, status: 'pending', internalNotes: '' };
      mockPrisma.consultationRequest.findUnique.mockResolvedValue(existing);
      mockPrisma.consultationRequest.update.mockImplementation(
        (args: { data: { internalNotes: string } }) =>
          Promise.resolve({
            ...existing,
            status: 'contacted',
            internalNotes: args.data.internalNotes,
          }),
      );
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.updateStatus(
        1,
        { status: 'contacted', internalNotes: 'test note' },
        1,
        'admin',
      );
      expect(result.internalNotes).toContain('test note');
    });
  });

  describe('assign', () => {
    it('should assign request to operator', async () => {
      mockPrisma.consultationRequest.findUnique.mockResolvedValue({
        id: 1,
        assignedToId: null,
      });
      mockPrisma.consultationRequest.update.mockResolvedValue({
        id: 1,
        assignedToId: 2,
      });

      const result = await service.assign(1, 2, 1, 'admin');
      expect(result.assignedToId).toBe(2);
    });

    it('should prevent non-admin from assigning to others', async () => {
      await expect(service.assign(1, 2, 3, 'consultant')).rejects.toThrow();
    });
  });

  describe('addNote', () => {
    it('should append note to existing notes', async () => {
      mockPrisma.consultationRequest.findFirst.mockResolvedValue({
        id: 1,
        internalNotes: '',
      });
      mockPrisma.consultationRequest.update.mockResolvedValue({
        id: 1,
        internalNotes: '[...] test',
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.addNote(1, 'test', 1, 'admin');
      expect(result.internalNotes).toContain('test');
    });
  });
});
