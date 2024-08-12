import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'
import { initializeAPMAgent } from './utils/monitoring/apm.init'
import { NestExpressApplication } from '@nestjs/platform-express'

initializeAPMAgent()

import * as compression from 'compression'
import { useSwagger } from './utils/swagger/swagger.middleware'
import {
  BadRequestException,
  ValidationError,
  ValidationPipe
} from '@nestjs/common'
import helmet from 'helmet'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  })
  const appConfig = app.get<ConfigService>(ConfigService)
  const port = appConfig.get('port')
  const isWorkerMode = appConfig.get('isWorkerMode')
  const task = appConfig.get('task')
  const logger = app.get(Logger)
  app.useLogger(logger)

  if (task) {
  } else if (isWorkerMode) {
  } else {
    app.use(compression())
    useSwagger(appConfig, app)
    app.use(helmet())
    app.enableCors()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        enableDebugMessages: true,
        exceptionFactory: (
          validationErrors: ValidationError[] = []
        ): unknown => {
          logger.warn(JSON.stringify(validationErrors))
          return new BadRequestException(validationErrors)
        }
      })
    )
    app.disable('x-powered-by')
    await app.listen(port)
  }
  app.flushLogs()
}

bootstrap()
