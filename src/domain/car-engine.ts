import { Inject, Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { DateService } from '../utils/date.service'

export const JobPlannerRepositoryToken = 'JobPlannerRepositoryToken'

export namespace CarEngine {
  export interface Repository {
    getFromStorage
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
    UPDATE_CAR_ENGINES = 'UPDATE_CAR_ENGINES'
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
    description: 'Daily 04:00'
  },
  {
    type: JobPlanner.JobType.UPDATE_CAR_ENGINES,
    expression: '0 2 * * *',
    description: 'Daily 02:00'
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
