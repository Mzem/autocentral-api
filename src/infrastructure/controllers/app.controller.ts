import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface'
import {
  ApiKeyAccessLevel,
  ApiKeyAuthGuard,
  METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL
} from '../../utils/auth/api-key.auth-guard'
import { ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('Health')
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
  @SetMetadata(METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL, ApiKeyAccessLevel.USER)
  @Get('api-key-user')
  async getApiKeyUser(): Promise<string> {
    return '👌'
  }

  @UseGuards(ApiKeyAuthGuard)
  @SetMetadata(
    METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL,
    ApiKeyAccessLevel.ADMIN
  )
  @Get('api-key-admin')
  async getApiKeyAdmin(): Promise<string> {
    return '👌'
  }

  @UseGuards(ApiKeyAuthGuard)
  @SetMetadata(
    METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL,
    ApiKeyAccessLevel.SCRIPT
  )
  @Get('api-key-script')
  async getApiKeyScript(): Promise<string> {
    return '👌'
  }
}
