import { Controller, Get, UseGuards } from '@nestjs/common'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface'
import { ApiKeyAuthGuard } from '../utils/auth/api-key.auth-guard'
import { ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('Default')
export class AppController {
  constructor(private health: HealthCheckService) {}

  @Get()
  getHello(): string {
    return 'JSAUTO API'
  }

  @Get('health')
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([])
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('api-key')
  async getApiKey(): Promise<string> {
    return '👌'
  }
}
