import { Inject, Injectable } from '@nestjs/common'
import {
  JobPlanner,
  JobPlannerRepositoryToken,
  ProcessJobType
} from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { JobHandler } from '../types/job-handler'
import { Job } from 'bull'

@Injectable()
@ProcessJobType(JobPlanner.JobType.CLEAN_JOBS)
export class CleanJobsJobHandler extends JobHandler<Job> {
  constructor(
    @Inject(JobPlannerRepositoryToken)
    private jobPlannerRepository: JobPlanner.Repository,
    private dateService: DateService
  ) {
    super(JobPlanner.JobType.CLEAN_JOBS)
  }

  async handle(): Promise<JobPlanner.Stats> {
    let error
    let stats = {}
    const now = this.dateService.now()

    try {
      stats = await this.jobPlannerRepository.deleteOldJobs()
    } catch (e) {
      error = e
    }

    return {
      jobType: this.jobType,
      errors: 0,
      success: !error,
      executionDate: now,
      executionTime: DateService.countExecutionTime(now),
      result: error ?? stats,
      error
    }
  }
}
