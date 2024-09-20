import { Inject, Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { DateService } from '../utils/date.service'

export const JobPlannerRepositoryToken = 'JobPlannerRepositoryToken'

export namespace JobPlanner {
  export interface Repository {
    createJob<T>(job: Job<T>, jobId?: string, params?: JobParams): Promise<void>

    createCronJob(cronJob: CronJob): Promise<void>

    subscribe(callback: Handler<unknown>): Promise<void>

    deleteJobs(): Promise<void>

    deleteCronJobs(): Promise<void>

    deleteOldJobs(): Promise<number>

    deleteJobsWithPattern(pattern: string): Promise<void>

    isRunning(jobType: JobPlanner.JobType): Promise<boolean>
  }

  export interface JobParams {
    priority?: number
    attempts?: number
    backoff?: {
      type?: 'fixed' | 'exponential'
      delay?: number
    }
  }

  export enum JobType {
    FAKE = 'FAKE',
    CLEAN_JOBS = 'CLEAN_JOBS',
    SCRAP_BRPERF = 'SCRAP_BRPERF',
    SCRAP_SHIFTECH = 'SCRAP_SHIFTECH',
    UPDATE_CAR_ENGINES_BRPERF = 'UPDATE_CAR_ENGINES_BRPERF',
    UPDATE_CAR_ENGINES_SHIFTECH = 'UPDATE_CAR_ENGINES_SHIFTECH'
  }

  export interface JobFake {
    message: string
  }

  export type JobContent = JobFake

  export interface Job<T = JobContent> {
    executionDate: Date
    type: JobType
    content: T
  }

  export interface CronJob {
    type: JobType
    expression: string
    description?: string
    executionStartDate?: Date
  }

  export interface Handler<T> {
    (job: Job<T>): Promise<void>
  }

  export interface Stats {
    jobType: JobType
    executionDate: DateTime
    success: boolean
    result: unknown
    errors: number
    executionTime: number
    error?: { stack?: string; message?: string }
  }
}

export const cronJobList: JobPlanner.CronJob[] = [
  {
    type: JobPlanner.JobType.CLEAN_JOBS,
    expression: '0 4 * * *',
    description: 'Daily at 04:00'
  },
  {
    type: JobPlanner.JobType.SCRAP_SHIFTECH,
    expression: '0 0 * * 0',
    description: 'Each sunday at 00:00'
  }
]

@Injectable()
export class JobPlannerService {
  constructor(
    @Inject(JobPlannerRepositoryToken)
    private jobPlannerRepository: JobPlanner.Repository,
    private dateService: DateService
  ) {}

  async planCronJobs(): Promise<void> {
    for (const cronJob of cronJobList) {
      await this.jobPlannerRepository.createCronJob(cronJob)
    }
  }
}

export function ProcessJobType(type: JobPlanner.JobType): ClassDecorator {
  return function (target) {
    Reflect.defineMetadata('jobType', type, target)
  }
}
