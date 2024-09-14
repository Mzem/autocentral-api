import { Logger } from '@nestjs/common'
import { JobPlanner } from '../../domain/job-planner'
import { LogEvent, LogEventKey } from './log.event'
import JobType = JobPlanner.JobType
import JobStats = JobPlanner.Stats

export abstract class JobHandler<T> {
  protected logger: Logger
  protected jobType: JobType

  constructor(jobType: JobType) {
    this.jobType = jobType
    this.logger = new Logger(jobType)
  }

  async execute(job?: T): Promise<JobStats> {
    try {
      const JobStats = await this.handle(job)

      this.logAfter(JobStats)
      return JobStats
    } catch (e) {
      this.logAfter(e)
      throw e
    }
  }

  abstract handle(job?: T): Promise<JobStats>

  protected logAfter(result: JobStats, command?: T): void {
    const event = new LogEvent(LogEventKey.JOB_EVENT, {
      handler: this.jobType,
      command: command,
      result: result
    })
    this.logger.log(event)
  }
}
