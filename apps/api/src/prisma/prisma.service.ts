import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: { db: { url: process.env.DATABASE_URL } },
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
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.warn('DB_DISCONNECT_FAILED');
    }
  }

  private enforceAuditImmutability() {
    this.$use(async (params, next) => {
      if (params.model === 'AuditLog') {
        const allowed = [
          'create',
          'findUnique',
          'findFirst',
          'findMany',
          'count',
          'aggregate',
          'groupBy',
        ];
        if (!allowed.includes(params.action)) {
          this.logger.warn(
            `Blocked forbidden operation on AuditLog: ${params.action}`,
          );
          throw new Error('Operations on audit log are not allowed');
        }
      }
      return next(params);
    });
  }
}
