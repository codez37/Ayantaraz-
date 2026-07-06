import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserRole } from '@ayantaraz/shared/enums';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async updateProfile(
    userId: number,
    data: { firstName?: string; lastName?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'profile_update',
        entityType: 'user',
        entityId: userId,
        newValue: data,
      },
    });

    return user;
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUserRole(userId: number, role: string) {
    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      throw new HttpException('نقش نامعتبر است', HttpStatus.BAD_REQUEST);
    }

    // Check user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new HttpException('کاربر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as Prisma.EnumUserRoleFieldUpdateOperationsInput },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'role_update',
        entityType: 'user',
        entityId: userId,
        newValue: { role },
      },
    });

    return user;
  }

  async blockUser(userId: number) {
    // Check user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new HttpException('کاربر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'user_block',
        entityType: 'user',
        entityId: userId,
        newValue: { isActive: false },
      },
    });

    return user;
  }

  async unblockUser(userId: number) {
    // Check user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new HttpException('کاربر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'user_unblock',
        entityType: 'user',
        entityId: userId,
        newValue: { isActive: true },
      },
    });

    return user;
  }
}
