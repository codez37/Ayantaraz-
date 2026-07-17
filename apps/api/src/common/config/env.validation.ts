import { plainToInstance } from 'class-transformer';
import { IsString, IsOptional, IsIn, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string;

  @IsString()
  REDIS_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  SMS_API_KEY!: string;

  @IsString()
  @IsIn(['development', 'production', 'test'])
  @IsOptional()
  NODE_ENV!: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS!: string;

  @IsString()
  @IsOptional()
  LOG_LEVEL!: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    const msg = errors
      .map((e) => Object.values(e.constraints || {}).join(', '))
      .join('\n');

    throw new Error(`ENV_VALIDATION_FAILED:\n${msg}`);
  }

  return validated;
}
