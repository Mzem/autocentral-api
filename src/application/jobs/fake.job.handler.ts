import { Injectable } from '@nestjs/common'
import { JobPlanner, ProcessJobType } from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { JobHandler } from '../types/job-handler'
import { Job } from '../types/job'

@Injectable()
@ProcessJobType(JobPlanner.JobType.FAKE)
export class FakeJobHandler extends JobHandler<Job> {
  constructor(private dateService: DateService) {
    super(JobPlanner.JobType.FAKE)
  }

  async handle(job: Job): Promise<JobPlanner.Stats> {
    const maintenant = this.dateService.now()
    this.logger.log({
      job,
      msg: 'executed'
    })
    return {
      jobType: this.jobType,
      errors: 0,
      success: true,
      executionDate: maintenant,
      executionTime: maintenant.diffNow().milliseconds * -1,
      result: {}
    }
  }
}
