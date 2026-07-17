import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    await this.getProfile(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { firstName: dto.firstName, lastName: dto.lastName ?? '' },
    });
  }

  async listUsers(
    page = 1,
    limit = 20,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page: safePage, limit: safeLimit };
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException('Invalid role');
    }
    await this.getProfile(id);
    return this.prisma.user.update({
      where: { id },
      data: { role: role as UserRole },
    });
  }

  async blockUser(id: number): Promise<User> {
    await this.getProfile(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async unblockUser(id: number): Promise<User> {
    await this.getProfile(id);
    return this.prisma.user.update({ where: { id }, data: { isActive: true } });
  }
}
