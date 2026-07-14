import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Full health check', description: 'Check the health of all application components' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async checkHealth() {
    const health = await this.healthService.checkHealth();
    if (health.status !== 'healthy') {
      return {
        ...health,
        status: health.status,
      };
    }
    return health;
  }

  @Get('database')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Database health check', description: 'Check database connection' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is not available' })
  async checkDatabase() {
    const result = await this.healthService.checkDatabase();
    if (!result.connected) {
      return {
        ...result,
        status: 'down',
      };
    }
    return {
      ...result,
      status: 'up',
    };
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ping endpoint', description: 'Simple ping/pong endpoint' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  async ping() {
    return this.healthService.ping();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness check', description: 'Check if the service is ready to accept traffic' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready() {
    const result = await this.healthService.ready();
    if (!result.ready) {
      return {
        ...result,
        ready: false,
      };
    }
    return result;
  }

  @Get('info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Application info', description: 'Get application information' })
  @ApiResponse({ status: 200, description: 'Application information' })
  async info() {
    return this.healthService.getInfo();
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Application metrics', description: 'Get application performance metrics' })
  @ApiResponse({ status: 200, description: 'Application metrics' })
  async metrics() {
    return this.healthService.getMetrics();
  }
}