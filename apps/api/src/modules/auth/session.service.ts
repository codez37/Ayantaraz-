import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    tokenId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.prisma.session.create({
      data: { userId, tokenId, ipAddress, deviceInfo, expiresAt },
    });
  }

  async revokeAll(userId: number) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeById(id: number) {
    await this.prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async getActiveSession(userId: number) {
    return this.prisma.session.findFirst({
      where: { userId, revokedAt: null, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
