import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

export const METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL = 'API_KEY_LEVEL'
export enum ApiKeyAccessLevel {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SCRIPT = 'SCRIPT'
}

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.checkApiKey(context)
  }

  private async checkApiKey(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest()
    const apiKeyRequest = req.header('X-API-KEY')
    if (!apiKeyRequest) {
      throw new UnauthorizedException(`API KEY not found in header 'X-API-KEY'`)
    }

    let authorizedApiKeys = []
    const partenaire = this.reflector.get<ApiKeyAccessLevel>(
      METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL,
      context.getHandler()
    )
    switch (partenaire) {
      case ApiKeyAccessLevel.USER:
        authorizedApiKeys = this.configService
          .get('authorizedApiKeys.user')
          .concat(this.configService.get('authorizedApiKeys.admin'))
        break
      case ApiKeyAccessLevel.ADMIN:
        authorizedApiKeys = this.configService.get('authorizedApiKeys.admin')
        break
      case ApiKeyAccessLevel.SCRIPT:
        authorizedApiKeys = this.configService
          .get('authorizedApiKeys.script')
          .concat(this.configService.get('authorizedApiKeys.admin'))
        break
    }

    if (authorizedApiKeys.includes(apiKeyRequest)) {
      return true
    }

    throw new UnauthorizedException('Invalid API KEY')
  }
}
