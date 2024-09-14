import { Injectable } from '@nestjs/common'
import { JobPlanner, ProcessJobType } from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { JobHandler } from '../types/job-handler'
import { Job } from '../types/job'

@Injectable()
@ProcessJobType(JobPlanner.JobType.UPDATE_CAR_ENGINES)
export class UpdateCarEnginesJobHandler extends JobHandler<Job> {
  constructor(
    private readonly carEngineRepository: Car,
    private dateService: DateService
  ) {
    super(JobPlanner.JobType.UPDATE_CAR_ENGINES)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()

    const engines = this.carEngineRepository.getCarEngines()

    return {
      jobType: this.jobType,
      errors: 0,
      success: true,
      executionDate: now,
      executionTime: now.diffNow().milliseconds * -1,
      result: {}
    }
  }
}
