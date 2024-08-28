/* eslint-disable no-process-env */
import { HttpModule } from '@nestjs/axios'
import { INestApplication, Provider, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import * as dotenv from 'dotenv'
import { SinonSandbox, createSandbox } from 'sinon'
import { AppController } from '../../src/controllers/app.controller'
dotenv.config({ path: '.environment' })

export function buildTestingModuleForHttpTesting(
  sandbox: SinonSandbox = createSandbox()
): TestingModuleBuilder {
  return Test.createTestingModule({
    imports: [HttpModule, ConfigModule.forRoot(), TerminusModule],
    providers: stubProviders(sandbox),
    controllers: [AppController]
  })
}

let applicationForHttpTesting: INestApplication
let sandbox: SinonSandbox

export const getApplicationWithStubbedDependencies =
  async (): Promise<INestApplication> => {
    if (!applicationForHttpTesting) {
      sandbox = createSandbox()
      const testingModule = await buildTestingModuleForHttpTesting(
        sandbox
      ).compile()

      applicationForHttpTesting = testingModule.createNestApplication()
      applicationForHttpTesting.useGlobalPipes(
        new ValidationPipe({ whitelist: true })
      )
      await applicationForHttpTesting.init()
    }

    afterEach(() => {
      sandbox.reset()
    })
    return applicationForHttpTesting
  }

export const testConfig = (): ConfigService => {
  return new ConfigService({
    environment: 'staging',
    port: 5050,
    cors: {
      allowedOrigins: []
    },
    authorizedApiKeys: {
      user: ['test-api-key'],
      admin: ['test-api-key-admin']
    },
    database: {
      url: 'postgresql://jsauto:jsauto@localhost:55555/jsautodb'
    }
  })
}

const stubProviders = (_sandbox: SinonSandbox): Provider[] => {
  const providers: Provider[] = [
    {
      provide: ConfigService,
      useValue: testConfig()
    }
  ]
  return providers
}
