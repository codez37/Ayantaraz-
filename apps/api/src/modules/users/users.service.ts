import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByPhone(phone: string): Promise<User | null> {
    this.logger.debug(`Finding user by phone: ${phone}`);
    return this.prisma.user.findUnique({
      where: { phone },
      include: {
        sessions: false,
        refreshTokens: false,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    this.logger.debug(`Finding user by ID: ${id}`);
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        sessions: false,
        refreshTokens: false,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`);
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(
    phone: string,
    passwordHash: string,
    firstName?: string,
    lastName?: string,
    email?: string,
  ): Promise<User> {
    this.logger.log(`Creating new user with phone: ${phone}`);
    const existingUser = await this.findByPhone(phone);
    if (existingUser) {
      this.logger.warn(`User with phone ${phone} already exists`);
      throw new Error('User with this phone number already exists');
    }
    return this.prisma.user.create({
      data: {
        phone,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || null,
        role: 'user',
        isActive: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      passwordHash?: string;
      role?: string;
      isActive?: boolean;
    },
  ): Promise<User> {
    this.logger.log(`Updating user ${id}`);
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`User ${id} not found`);
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    this.logger.log(`Updating password for user ${userId}`);
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async list(
    page: number = 1,
    limit: number = 10,
    role?: string,
    isActive?: boolean,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    this.logger.debug(`Listing users - page: ${page}, limit: ${limit}`);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      users: users as any[],
      total,
      page,
      limit,
    };
  }

  async delete(id: string): Promise<User> {
    this.logger.log(`Deleting user ${id}`);
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`User ${id} not found`);
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async hardDelete(id: string): Promise<User> {
    this.logger.warn(`Hard deleting user ${id}`);
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`User ${id} not found`);
      throw new NotFoundException('User not found');
    }
    await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    await this.prisma.session.deleteMany({ where: { userId: id } });
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findAdmins(): Promise<User[]> {
    this.logger.debug('Finding admin users');
    return this.prisma.user.findMany({
      where: { role: 'admin', isActive: true },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async isAdmin(phone: string): Promise<boolean> {
    const user = await this.findByPhone(phone);
    return user?.role === 'admin' && user.isActive;
  }

  async getProfile(userId: string): Promise<any> {
    this.logger.debug(`Getting profile for user ${userId}`);
    const user = await this.findById(userId);
    if (!user) {
      this.logger.error(`User ${userId} not found`);
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async search(query: string, limit: number = 10): Promise<User[]> {
    this.logger.debug(`Searching users with query: ${query}`);
    return this.prisma.user.findMany({
      where: {
        OR: [
          { phone: { contains: query } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: limit,
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<User> {
    this.logger.debug(`Updating last login for user ${userId}`);
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}