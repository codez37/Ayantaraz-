import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: { db: { url: process.env.DATABASE_URL } },
      pool: {
        max_connections: parseInt(process.env.DB_POOL_MAX_CONNECTIONS || '20'),
        min_connections: parseInt(process.env.DB_POOL_MIN_CONNECTIONS || '5'),
        max_requests_per_connection: parseInt(process.env.DB_POOL_MAX_REQUESTS_PER_CONNECTION || '100'),
        idle_timeout_ms: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000'),
        connection_timeout_ms: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS || '5000'),
      },
    });
  }

  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch (error) {
      this.logger.error('DB_CONNECT_FAILED');
      throw error;
    }
    this.enforceAuditImmutability();
  }

  async onModuleDestroy() {
    try { await this.$disconnect(); } catch (error) { this.logger.warn('DB_DISCONNECT_FAILED'); }
  }

  private enforceAuditImmutability() {
    this.$use(async (params, next) => {
      if (params.model === 'AuditLog') {
        const allowed = ['create', 'findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'];
        if (!allowed.includes(params.action)) {
          this.logger.warn(`Blocked forbidden operation on AuditLog: ${params.action}`);
          throw new Error('Operations on audit log are not allowed');
        }
      }
      return next(params);
    });
  }
}