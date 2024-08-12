import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import configuration from './config/configuration'
import { configureLoggerModule } from './utils/monitoring/logger.module'
import { AppController } from './controllers/app.controller'
import { ApiKeyAuthGuard } from './utils/auth/api-key.auth-guard'
import { databaseProviders } from './infrastructure/sequelize/providers'

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
  controllers: [AppController],
  providers: [ApiKeyAuthGuard, ...databaseProviders],
  exports: [...databaseProviders]
})
export class AppModule {}
