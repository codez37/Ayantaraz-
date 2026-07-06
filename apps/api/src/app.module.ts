import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContentModule } from './modules/content/content.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { TaxEngineModule } from './modules/tax-engine/tax-engine.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { UploadModule } from './modules/upload/upload.module';
import { SeoModule } from './modules/seo/seo.module';
import { SecurityModule } from './modules/security/security.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { SecurityGuard } from './modules/security/security.guard';
import { validateEnv } from './common/config/env.validation';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { CsrfMiddleware } from './modules/security/csrf.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    SecurityModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ContentModule,
    CoursesModule,
    ConsultationModule,
    OrdersModule,
    ChatbotModule,
    TaxEngineModule,
    AuditModule,
    AdminModule,
    HealthModule,
    UploadModule,
    SeoModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: SecurityGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes('*');
  }
}
