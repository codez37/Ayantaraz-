import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import { JsonLogger } from './common/logger/json-logger.service';
import { PrismaService } from './prisma/prisma.service';

const logger = new JsonLogger();

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function waitForDatabase(prisma: PrismaService, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.log('Database connection established', 'Bootstrap');
      return;
    } catch (err) {
      logger.error(
        `DB not ready (attempt ${i + 1}/${retries})`,
        err instanceof Error ? err.stack : undefined,
        'Bootstrap',
      );
      await sleep(1500 * (i + 1));
    }
  }
  throw new Error('Database unreachable after retries');
}

let isShuttingDown = false;

// ============================================================
// ✅ CORS TYPE - کاملاً type-safe
// ============================================================
type CorsCallback = (err: Error | null, allow?: boolean) => void;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
    forceCloseConnections: true,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const isDocker = process.env.DOCKER_ENV === 'true';

  // ============================================================
  // TRUST PROXY
  // ============================================================
  if (isDocker) {
    app.set('trust proxy', 1);
  }

  // ============================================================
  // STATIC FILES
  // ============================================================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    maxAge: isProduction ? 7 * 24 * 60 * 60 * 1000 : 0,
  });

  app.use(cookieParser());

  // ============================================================
  // 🔥 HELMET - با filter خالی برای robustness
  // ============================================================
  const frontendUrl = process.env.FRONTEND_URL || '';
  const apiUrl = process.env.API_URL || '';

  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              baseUri: ["'self'"],
              frameAncestors: ["'none'"],
              formAction: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              // ✅ فقط منابعی که واقعاً وجود دارند اضافه کن
              connectSrc: [
                "'self'",
                ...(frontendUrl ? [frontendUrl] : []),
                ...(apiUrl ? [apiUrl] : []),
                ...(process.env.EXTRA_CONNECT_SRC?.split(',').filter(Boolean) ||
                  []),
              ],
            },
          }
        : false,
      hsts: isProduction
        ? { maxAge: 63072000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  // ============================================================
  // 🔥 CORS - نسخه Cloud-Grade با pipeline صحیح
  // ============================================================
  const rawOrigins = process.env.TRUSTED_ORIGINS ?? '';

  // ✅ Validation: فقط origins معتبر را قبول کن
  const isValidOrigin = (origin: string): boolean => {
    if (!origin) return false;

    // در production فقط HTTPS
    if (process.env.NODE_ENV === 'production') {
      return /^https:\/\/[a-z0-9.-]+(\.[a-z]{2,})(:\d+)?$/i.test(origin);
    }

    // در development HTTP هم مجاز است
    return /^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(origin);
  };

  // ✅ Normalization: فقط lower case و حذف trailing slash (RFC compliant)
  const normalizeOrigin = (origin: string): string => {
    return origin.toLowerCase().replace(/\/$/, '');
  };

  // ✅ ترتیب صحیح: اول validation، بعد normalization
  const trustedOrigins = new Set(
    rawOrigins
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .filter(isValidOrigin)
      .map(normalizeOrigin),
  );

  // ✅ Warning در صورت خالی بودن (بدون auto-bypass)
  if (trustedOrigins.size === 0) {
    if (isProduction) {
      logger.warn(
        '⚠️ TRUSTED_ORIGINS is empty in PRODUCTION - CORS will block all origins!',
        'Bootstrap',
      );
    } else {
      logger.warn(
        '⚠️ TRUSTED_ORIGINS is empty in DEVELOPMENT - CORS will only allow localhost',
        'Bootstrap',
      );
    }
  }

  const corsOrigin = (origin: string | undefined, callback: CorsCallback) => {
    // Allow requests with no origin (mobile apps, server-to-server, webhooks)
    if (!origin) return callback(null, true);

    const normalized = normalizeOrigin(origin);

    // ✅ Production: فقط origins مجاز
    if (isProduction) {
      if (trustedOrigins.has(normalized)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    }

    // ✅ Development: logic looser اما بدون auto-bypass
    // 1. چک کردن trusted origins
    if (trustedOrigins.has(normalized)) {
      return callback(null, true);
    }

    // 2. localhost با هر پورتی
    if (/^https?:\/\/localhost(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }

    // 3. 127.0.0.1 با هر پورتی
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }

    // ⚠️ حذف auto-bypass برای trustedOrigins.size === 0

    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  };

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-API-Key',
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // ============================================================
  // GLOBAL PIPELINE
  // ============================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new RequestLoggerInterceptor());

  app.setGlobalPrefix('api', { exclude: ['health'] });

  const port = Number(process.env.PORT || 3001);

  // ============================================================
  // PRISMA + DB WAIT
  // ============================================================
  const prisma = app.get(PrismaService);
  await waitForDatabase(prisma);

  // ============================================================
  // START SERVER
  // ============================================================
  const server = await app.listen(port, '0.0.0.0');

  server.keepAliveTimeout = 70_000;
  server.headersTimeout = 75_000;

  logger.log(`🚀 API running on 0.0.0.0:${port}`, 'Bootstrap');
  logger.log(
    `🔒 Environment: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap',
  );
  logger.log(
    `🌐 CORS enabled for ${trustedOrigins.size} trusted origins`,
    'Bootstrap',
  );

  if (trustedOrigins.size > 0) {
    logger.debug(
      `📋 Trusted origins: ${Array.from(trustedOrigins).join(', ')}`,
      'Bootstrap',
    );
  }

  // ============================================================
  // ✅ GRACEFUL SHUTDOWN - با drain کامل
  // ============================================================
  const shutdown = async (signal: NodeJS.Signals) => {
    if (isShuttingDown) return;

    isShuttingDown = true;
    logger.log(`Received ${signal} — starting graceful shutdown`, 'Bootstrap');

    const forceKill = setTimeout(() => {
      logger.error(
        'Force shutdown triggered after timeout',
        undefined,
        'Bootstrap',
      );
      process.exit(1);
    }, 20000);

    try {
      // ✅ 1. Stop accepting new connections
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.log('HTTP server closed', 'Bootstrap');
          resolve();
        });
      });

      // ✅ 2. Wait for existing connections to drain (TCP buffer)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ 3. Close NestJS application
      await app.close();
      logger.log('NestJS application closed', 'Bootstrap');

      // ✅ 4. Clean Prisma connection
      await prisma.$disconnect();
      logger.log('Prisma disconnected', 'Bootstrap');

      clearTimeout(forceKill);

      logger.log('✅ Graceful shutdown complete', 'Bootstrap');
      process.exit(0);
    } catch (err) {
      clearTimeout(forceKill);

      logger.error(
        'Shutdown failed',
        err instanceof Error ? err.stack : undefined,
        'Bootstrap',
      );

      try {
        await prisma.$disconnect();
      } catch {
        // Ignore
      }

      process.exit(1);
    }
  };

  // ============================================================
  // PROCESS SIGNALS
  // ============================================================
  ['SIGTERM', 'SIGINT'].forEach((sig) => {
    process.on(
      sig as NodeJS.Signals,
      () => void shutdown(sig as NodeJS.Signals),
    );
  });

  // ============================================================
  // UNHANDLED EXCEPTIONS
  // ============================================================
  process.on('unhandledRejection', (reason: any) => {
    logger.error(
      'Unhandled Rejection',
      reason?.stack || reason?.message || String(reason),
      'Bootstrap',
    );
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception', err.stack, 'Bootstrap');
    process.exit(1);
  });
}

// ============================================================
// BOOTSTRAP ENTRYPOINT
// ============================================================
void (async () => {
  try {
    await bootstrap();
  } catch (err) {
    logger.error(
      'Bootstrap failed',
      err instanceof Error ? err.stack : undefined,
      'Bootstrap',
    );
    process.exit(1);
  }
})();
