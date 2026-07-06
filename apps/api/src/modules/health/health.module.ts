import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [HealthController],
})
export class HealthModule {}
