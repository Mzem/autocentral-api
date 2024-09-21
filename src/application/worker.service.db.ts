import { Inject, Injectable, Logger, Type } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { JobPlanner, JobPlannerRepositoryToken } from '../domain/job-planner'
import {
  getWorkerTrackingServiceInstance,
  WorkerTrackingService
} from '../utils/monitoring/worker.tracking.service'
import { JobHandlerProviders } from '../app.module'
import { JobHandler } from './types/job-handler'
import { DateService } from '../utils/date.service'
import { DateTime } from 'luxon'

@Injectable()
export class WorkerService {
  private workerTrackingService: WorkerTrackingService
  private readonly logger: Logger = new Logger('WorkerService')

  constructor(
    @Inject(JobPlannerRepositoryToken)
    private jobPlannerRepository: JobPlanner.Repository,
    private moduleRef: ModuleRef
  ) {
    this.workerTrackingService = getWorkerTrackingServiceInstance()
  }

  subscribe(): void {
    this.jobPlannerRepository.subscribe(this.handler.bind(this))
  }

  async handler(job: JobPlanner.Job<unknown>): Promise<void> {
    const jobName = `JOB-${job.type}`
    this.workerTrackingService.startJobTracking(jobName)
    const startTime = DateTime.now()
    let success = true
    this.logger.log({
      job,
      state: 'started'
    })
    let stats: JobPlanner.Stats | undefined
    try {
      const jobHandlerType = getJobHandlerTypeByJobType(job)
      if (!jobHandlerType) {
        this.logger.error(`Pas de job handler trouvé pour le type: ${job.type}`)
        success = false
      } else {
        const jobhandler =
          this.moduleRef.get<JobHandler<unknown>>(jobHandlerType)
        stats = await jobhandler.execute(job)
      }
    } catch (e) {
      success = false
      this.logger.error(e)
    } finally {
      this.logger.log({
        job,
        state: 'terminated',
        success,
        duration: DateService.countExecutionTime(startTime)
      })
      if (stats?.success === false || !success) {
        // On veut passer le job en fail sur le planificateur
        throw new Error(`${jobName} failed`)
      }
    }
  }
}

function getJobHandlerTypeByJobType(
  job: JobPlanner.Job<unknown>
): Type | undefined {
  return JobHandlerProviders.find(
    jobProvider => job.type === Reflect.getMetadata('jobType', jobProvider)
  )
}
