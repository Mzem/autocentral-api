import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import supertest from 'supertest'
import {
  buildTestingModuleForHttpTesting,
  testConfig
} from '../../test-utils/module-for-testing'
import { expect } from '../../test-utils'

const errorNoAPIKey = {
  error: 'Unauthorized',
  message: "API KEY not found in header 'X-API-KEY'",
  statusCode: 401
}

const errorInvalidAPIKey = {
  error: 'Unauthorized',
  message: 'Invalid API KEY',
  statusCode: 401
}

describe(`ApiKeyAuthGuard`, () => {
  let app: INestApplication
  before(async () => {
    const testingModule = await buildTestingModuleForHttpTesting().compile()
    app = testingModule.createNestApplication()
    await app.init()
  })
  after(async () => {
    await app.close()
  })

  describe('no header X-API-KEY', () => {
    let response: supertest.Response
    it('returns 401 status code', async () => {
      // When
      response = await request(app.getHttpServer()).get('/api-key-user')
      //Then
      expect(response).to.have.property('statusCode').to.equal(401)
      expect(response.body).to.be.deep.equal(errorNoAPIKey)
    })
  })
  describe('header X-API-KEY + valid key (USER)', () => {
    let response: supertest.Response
    it('retourne 200 status code', async () => {
      // When
      const apiKey: string = testConfig().get<string[]>(
        'authorizedApiKeys.user'
      )![0]
      response = await request(app.getHttpServer())
        .get('/api-key-user')
        .set('X-API-KEY', apiKey)

      //Then
      expect(response).to.have.property('statusCode').to.equal(200)
    })
  })
  describe('header X-API-KEY + valid key (USER avec clé admin)', () => {
    let response: supertest.Response
    it('retourne 200 status code', async () => {
      // When
      const apiKey: string = testConfig().get<string[]>(
        'authorizedApiKeys.admin'
      )![0]
      response = await request(app.getHttpServer())
        .get('/api-key-user')
        .set('X-API-KEY', apiKey)

      //Then
      expect(response).to.have.property('statusCode').to.equal(200)
    })
  })
  describe('header X-API-KEY + valid key (ADMIN)', () => {
    let response: supertest.Response
    it('retourne 200 status code', async () => {
      // When
      const apiKey: string = testConfig().get<string[]>(
        'authorizedApiKeys.admin'
      )![0]
      response = await request(app.getHttpServer())
        .get('/api-key-admin')
        .set('X-API-KEY', apiKey)

      //Then
      expect(response).to.have.property('statusCode').to.equal(200)
    })
  })

  describe('header X-API-KEY + invalid key', () => {
    let response: supertest.Response
    it('retourne 401 status code', async () => {
      // When
      const apiKey: string = testConfig().get<string[]>(
        'authorizedApiKeys.user'
      )![0]
      response = await request(app.getHttpServer())
        .get('/api-key-admin')
        .set('X-API-KEY', apiKey)

      //Then
      expect(response).to.have.property('statusCode').to.equal(401)
      expect(response.body).to.be.deep.equal(errorInvalidAPIKey)
    })
  })

  describe('header X-API-KEY + invalid key', () => {
    let response: supertest.Response
    it('retourne 401 status code', async () => {
      // When
      const apiKey = 'invalid'
      response = await request(app.getHttpServer())
        .get('/api-key-user')
        .set('X-API-KEY', apiKey)

      //Then
      expect(response).to.have.property('statusCode').to.equal(401)
      expect(response.body).to.be.deep.equal(errorInvalidAPIKey)
    })
  })
})
