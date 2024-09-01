import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import configuration from './config/configuration'
import { configureLoggerModule } from './utils/monitoring/logger.module'
import { AppController } from './infrastructure/controllers/app.controller'
import { ApiKeyAuthGuard } from './utils/auth/api-key.auth-guard'
import { databaseProviders } from './infrastructure/sequelize/providers'
import { GetCarMakesQueryHandler } from './application/queries/get-car-makes.query.handler.db'
import { GetCarModelsNamesQueryHandler } from './application/queries/get-car-models-names.query.handler.db'
import { CarModelsController } from './infrastructure/controllers/car-models.controller'
import { CarMakesController } from './infrastructure/controllers/car-makes.controller'
import { GetCarModelListQueryHandler } from './application/queries/get-car-model-list.query.handler.db'
import { GetCarModelDetailQueryHandler } from './application/queries/get-car-model-detail.query.handler.db'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.environment',
      cache: true,
      load: [configuration]
    }),
    TerminusModule,
    configureLoggerModule()
  ],
  controllers: [CarMakesController, CarModelsController, AppController],
  providers: [
    ApiKeyAuthGuard,
    ...databaseProviders,
    GetCarMakesQueryHandler,
    GetCarModelsNamesQueryHandler,
    GetCarModelListQueryHandler,
    GetCarModelDetailQueryHandler
  ],
  exports: [...databaseProviders]
})
export class AppModule {}
