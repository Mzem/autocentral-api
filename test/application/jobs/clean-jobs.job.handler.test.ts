import { StubbedType, stubInterface } from '@salesforce/ts-sinon'
import { SinonSandbox } from 'sinon'
import {
  expect,
  StubbedClass,
  stubClass,
  createSandbox
} from '../../test-utils'
import { DateService } from '../../../src/utils/date.service'
import { CleanJobsJobHandler } from '../../../src/application/jobs/clean-jobs.job.handler'
import { JobPlanner } from '../../../src/domain/job-planner'

describe('CleanJobsJobHandler', () => {
  describe('handle', () => {
    it('cleans', () => {
      // Given
      const sandbox: SinonSandbox = createSandbox()
      const plannerRepository: StubbedType<JobPlanner.Repository> =
        stubInterface(sandbox)
      const dateService: StubbedClass<DateService> = stubClass(DateService)
      stubInterface(sandbox)
      const cleanJobsJobHandler = new CleanJobsJobHandler(
        plannerRepository,
        dateService
      )

      // When
      cleanJobsJobHandler.handle()

      // Then
      expect(plannerRepository.deleteOldJobs).to.have.callCount(1)
    })
  })
})
