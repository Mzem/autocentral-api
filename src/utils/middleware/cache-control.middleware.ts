import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CacheControlMiddleware implements NestMiddleware {
  private readonly maxAge?: number

  constructor(config: ConfigService) {
    this.maxAge = config.get('headers.maxAge')
  }

  use(_req: Request, res: Response, next: NextFunction): void {
    if (this.maxAge) res.header('Cache-control', `max-age=${this.maxAge}`)
    next()
  }
}
