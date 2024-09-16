import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'
import { initializeAPMAgent } from './utils/monitoring/apm.init'
import { NestExpressApplication } from '@nestjs/platform-express'

initializeAPMAgent()

import * as compression from 'compression'
import { useSwagger } from './utils/middleware/swagger.middleware'
import {
  BadRequestException,
  ValidationError,
  ValidationPipe
} from '@nestjs/common'
import helmet from 'helmet'
import { WorkerService } from './application/worker.service.db'
import { TaskService } from './application/task.service'

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

  if (task?.name) {
    app.flushLogs()
    await app.get(TaskService).handle(task.name, task.date)
    await app.close()
    process.exit(0)
  } else if (isWorkerMode) {
    app.flushLogs()
    logger.log('Mode WORKER activated')
    const worker = app.get(WorkerService)
    worker.subscribe()
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
    logger.log('App listening on port ' + port)
  }
  app.flushLogs()
}

bootstrap()
