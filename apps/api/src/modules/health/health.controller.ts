import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import * as path from 'path';
import { createClient, type RedisClientType } from 'redis';
import * as os from 'os';
import { retry } from '../../common/utils/retry';

@Controller('health')
export class HealthController implements OnModuleDestroy {
  private readonly logger = new Logger(HealthController.name);
  private redisClient: RedisClientType | null = null;

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async onModuleDestroy() {
    if (this.redisClient) await this.redisClient.disconnect().catch(() => {});
  }

  private async getRedisClient(): Promise<RedisClientType | null> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return null;

    if (this.redisClient) return this.redisClient;

    try {
      this.redisClient = createClient({
        url: redisUrl,
        socket: { connectTimeout: 2000 },
      });
      await this.redisClient.connect();
      return this.redisClient;
    } catch {
      this.redisClient = null;
      return null;
    }
  }

  @Public()
  @Get()
  async check(): Promise<{
    status: string;
    db: string;
    redis: string;
    disk: { free: number; total: number };
    memory: { used: number; total: number };
    timestamp: string;
  }> {
    let dbStatus = 'disconnected';
    let redisStatus = 'not_configured';

    // DB Check with Retry
    try {
      await retry(() => this.prisma.$queryRaw`SELECT 1`, 3, 1000);
      dbStatus = 'connected';
    } catch {
      this.logger.warn('Health check: DB unreachable after retries');
    }

    // Redis Check with Retry
    const client = await this.getRedisClient();
    if (client) {
      try {
        const pong = await Promise.race([
          retry(() => client.ping(), 3, 1000),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 5000),
          ),
        ]);
        redisStatus = pong === 'PONG' ? 'connected' : 'disconnected';
      } catch {
        redisStatus = 'disconnected';
        this.redisClient = null;
      }
    }

    // Disk Check
    const disk = this.checkDisk();
    if (disk.free < 100 * 1024 * 1024) {
      // < 100MB
      this.logger.warn('Health check: Low disk space');
    }

    // Memory Check
    const memory = this.checkMemory();
    if (memory.used > 0.9 * memory.total) {
      // > 90%
      this.logger.warn('Health check: High memory usage');
    }

    if (dbStatus === 'disconnected') {
      throw new HttpException(
        {
          status: 'error',
          db: dbStatus,
          redis: redisStatus,
          disk,
          memory,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'ok',
      db: dbStatus,
      redis: redisStatus,
      disk,
      memory,
      timestamp: new Date().toISOString(),
    };
  }

  private checkDisk(): { free: number; total: number } {
    const uploadDir = this.uploadService.getUploadDir();
    const stats = fs.statfsSync(uploadDir);
    return {
      free: stats.bfree * stats.bsize,
      total: stats.blocks * stats.bsize,
    };
  }

  private checkMemory(): { used: number; total: number } {
    const total = os.totalmem();
    const free = os.freemem();
    return {
      used: total - free,
      total,
    };
  }

  @Roles('admin')
  @Get('detailed')
  async detailed(): Promise<{
    status: string;
    db: string;
    uploads: {
      totalFiles: number;
      orphanFiles: number;
      missingReferences: number;
    };
    timestamp: string;
  }> {
    let dbConnected = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      this.logger.warn('Detailed health: DB unreachable');
    }

    let totalFiles = 0;
    let orphanFiles = 0;
    let missingReferences = 0;

    if (dbConnected) {
      try {
        const dbUrls = new Set<string>();

        const contents = await this.prisma.content.findMany({
          select: { id: true, mediaUrl: true, thumbnailUrl: true },
        });

        for (const c of contents) {
          if (c.mediaUrl) dbUrls.add(c.mediaUrl);
          if (c.thumbnailUrl) dbUrls.add(c.thumbnailUrl);
        }

        const uploadDir = this.uploadService.getUploadDir();
        const allFiles = this.walkDir(uploadDir);
        totalFiles = allFiles.length;

        const existingSet = new Set(allFiles);
        orphanFiles = allFiles.filter((f) => !dbUrls.has(f)).length;

        for (const c of contents) {
          if (
            c.mediaUrl &&
            c.mediaUrl.startsWith('/uploads/') &&
            !existingSet.has(c.mediaUrl)
          ) {
            missingReferences++;
          }
          if (
            c.thumbnailUrl &&
            c.thumbnailUrl.startsWith('/uploads/') &&
            !existingSet.has(c.thumbnailUrl)
          ) {
            missingReferences++;
          }
        }
      } catch (err) {
        this.logger.warn('Detailed health: media scan failed', err);
      }
    }

    const overallStatus = dbConnected ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      db: dbConnected ? 'connected' : 'disconnected',
      uploads: { totalFiles, orphanFiles, missingReferences },
      timestamp: new Date().toISOString(),
    };
  }

  private walkDir(dir: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.walkDir(full));
      } else {
        files.push(
          '/' +
            path
              .relative(this.uploadService.getUploadDir(), full)
              .replace(/\\/g, '/'),
        );
      }
    }
    return files;
  }
}
