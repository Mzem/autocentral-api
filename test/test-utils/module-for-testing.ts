/* eslint-disable no-process-env */
import { HttpModule } from '@nestjs/axios'
import {
  INestApplication,
  Provider,
  Type,
  ValidationPipe
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import * as dotenv from 'dotenv'
import { SinonSandbox, createSandbox } from 'sinon'
import {
  buildModuleMetadata,
  buildQueryCommandsProviders
} from '../../src/app.module'
import { parse } from 'pg-connection-string'
import { stubClass, stubClassSandbox } from './types'
import { DateService } from '../../src/utils/date.service'
import { uneDatetime } from './fixtures'
dotenv.config({ path: '.environment' })

export function buildTestingModuleForHttpTesting(
  sandbox: SinonSandbox = createSandbox()
): TestingModuleBuilder {
  const moduleMetadata = buildModuleMetadata()
  return Test.createTestingModule({
    imports: [HttpModule, ConfigModule.forRoot(), TerminusModule],
    providers: stubProviders(sandbox),
    controllers: [...moduleMetadata.controllers!]
  })
}
export function buildTestingModuleForEndToEndTesting(): TestingModuleBuilder {
  const moduleMetadata = buildModuleMetadata()
  return Test.createTestingModule({
    imports: [HttpModule, ConfigModule.forRoot(), TerminusModule],
    providers: [...moduleMetadata.providers!],
    controllers: [...moduleMetadata.controllers!]
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

const databaseUrl = process.env.DATABASE_URL as string
const { host, port, database, user, password } = parse(databaseUrl)
export const testConfig = (): ConfigService => {
  return new ConfigService({
    environment: 'staging',
    port: 5050,
    cors: {
      allowedOrigins: []
    },
    authorizedApiKeys: {
      user: ['test-api-key'],
      admin: ['test-api-key-admin'],
      script: ['test-api-key-script']
    },
    redis: {
      // eslint-disable-next-line no-process-env
      url: process.env.REDIS_URL || 'redis://localhost:7773'
    },
    database: {
      host,
      port,
      database,
      user,
      password
    }
  })
}

const stubProviders = (_sandbox: SinonSandbox): Provider[] => {
  const dateService = stubClass(DateService)
  dateService.now.returns(uneDatetime())
  const providers: Provider[] = [
    {
      provide: ConfigService,
      useValue: testConfig()
    },
    {
      provide: DateService,
      useValue: dateService
    }
  ]
  const queryCommandsProviders = buildQueryCommandsProviders().map(
    (provider: Provider): Provider => {
      return {
        provide: provider as Type,
        useValue: stubClassSandbox(provider as Type, sandbox)
      }
    }
  )
  return providers.concat(queryCommandsProviders)
}
