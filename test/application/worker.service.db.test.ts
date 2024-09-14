import { WorkerService } from '../../src/application/worker.service.db'
import { FakeJobHandler } from '../../src/application/jobs/fake.job.handler'
import {
  buildTestingModuleForEndToEndTesting,
  testConfig
} from '../test-utils/module-for-testing'
import {
  DatabaseForTesting,
  getDatabase
} from '../test-utils/database-for-testing'
import { INestApplication } from '@nestjs/common'
import { JobPlannerRepository } from '../../src/infrastructure/repositories/job-planner.repository.db'
import {
  JobPlanner,
  JobPlannerRepositoryToken
} from '../../src/domain/job-planner'
import { expect, stubClass } from '../test-utils'
import { ConfigService } from '@nestjs/config'

describe('WorkerService', () => {
  let database: DatabaseForTesting

  before(() => {
    database = getDatabase()
  })
  let app: INestApplication
  let fakeJobHandler: FakeJobHandler
  let jobPlannerRepository: JobPlannerRepository
  let workerService: WorkerService
  beforeEach(async () => {
    await database.cleanRedis()
    fakeJobHandler = stubClass(FakeJobHandler)

    const testingModule = await buildTestingModuleForEndToEndTesting()
      .overrideProvider(ConfigService)
      .useValue(testConfig())
      .overrideProvider(FakeJobHandler)
      .useValue(fakeJobHandler)
      .compile()

    app = testingModule.createNestApplication()
    await app.init()
    jobPlannerRepository = app.get(JobPlannerRepositoryToken)
    workerService = app.get(WorkerService)
  })

  afterEach(async () => {
    await app.close()
  })
  describe('handler', () => {
    beforeEach(async () => {
      // Given

      await jobPlannerRepository.isQueueReady()

      workerService.subscribe()

      // When
      const job: JobPlanner.Job = {
        executionDate: new Date(),
        type: JobPlanner.JobType.FAKE,
        content: { message: 'my test dummy job' }
      }
      await jobPlannerRepository.createJob(job)
    })

    it('execute corresponding job commande', done => {
      // Then
      setTimeout(() => {
        expect(fakeJobHandler.execute).to.have.been.calledWith()
        done()
      }, 1500)
    })
  })
})
