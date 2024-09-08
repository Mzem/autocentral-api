import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import configuration from './config/configuration'
import { configureLoggerModule } from './utils/monitoring/logger.module'
import { AppController } from './infrastructure/controllers/app.controller'
import { ApiKeyAuthGuard } from './utils/auth/api-key.auth-guard'
import { databaseProviders } from './infrastructure/sequelize/providers'
import { GetCarMakesQueryHandler } from './application/queries/get-car-makes.query.handler.db'
import { CarModelsController } from './infrastructure/controllers/car-models.controller'
import { CarMakesController } from './infrastructure/controllers/car-makes.controller'
import { GetCarModelListQueryHandler } from './application/queries/get-car-model-list.query.handler.db'
import { GetCarModelDetailQueryHandler } from './application/queries/get-car-model-detail.query.handler.db'
import { FindCarRegQueryHandler } from './application/queries/find-car-reg.query.handler.db'
import { CarRegsController } from './infrastructure/controllers/car-regs.controller'
import { GetPostCarRegQueryHandler } from './application/queries/scrap-regs/get-post-car-reg.query.handler.db'
import { GetPostCarRegNullQueryHandler } from './application/queries/scrap-regs/get-post-car-reg-null.query.handler.db'
import { GetMissingRSCarRegsQueryHandler } from './application/queries/scrap-regs/get-missing-car-regs.query.handler.db'

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
  controllers: [
    CarRegsController,
    CarMakesController,
    CarModelsController,
    AppController
  ],
  providers: [
    ApiKeyAuthGuard,
    ...databaseProviders,
    GetCarMakesQueryHandler,
    GetCarModelListQueryHandler,
    GetCarModelDetailQueryHandler,
    FindCarRegQueryHandler,
    GetPostCarRegQueryHandler,
    GetPostCarRegNullQueryHandler,
    GetMissingRSCarRegsQueryHandler
  ],
  exports: [...databaseProviders]
})
export class AppModule {}
