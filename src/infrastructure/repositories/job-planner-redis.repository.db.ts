import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Bull, * as QueueBull from 'bull'
import { DateService } from '../../utils/date.service'
import { JobPlanner } from '../../domain/job-planner'
import { DateTime, Duration } from 'luxon'

const CRON_TIMEZONE = 'Europe/Paris'

@Injectable()
export class JobPlannerRedisRepository implements JobPlanner.Repository {
  queue: Bull.Queue
  private isReady = false
  private logger: Logger

  constructor(
    private configService: ConfigService,
    private dateService: DateService
  ) {
    this.logger = new Logger('JobPlannerRedisRepository')
    this.queue = new QueueBull(
      'JobQueue',
      this.configService.get('redis').url,
      {
        redis: {
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
          retryStrategy: (times: number): number => {
            if (times > 1) {
              this.logger.error(
                'could not connect to redis!' + times.toString()
              )
            }
            this.isReady = true
            return 1000
          }
        }
      }
    )
    this.queue.isReady().then(() => {
      this.isReady = true
    })
  }

  async createJob<T>(
    job: JobPlanner.Job<T>,
    jobId?: string,
    params?: JobPlanner.JobParams
  ): Promise<void> {
    if (this.isReady) {
      const now = this.dateService.now()
      const delay = DateTime.fromJSDate(job.executionDate).diff(
        now
      ).milliseconds
      const jobOptions: Bull.JobOptions = {
        jobId: jobId,
        delay: delay,
        attempts: params?.attempts || 1,
        backoff: params?.backoff?.delay || 0,
        priority: params?.priority || 0
      }
      await this.queue.add(job, jobOptions)
    } else {
      throw new Error('Redis not ready to accept connection')
    }
  }

  async deleteJobs(): Promise<void> {
    await this.queue.removeJobs('*')
  }

  async subscribe(handle: JobPlanner.Handler<unknown>): Promise<void> {
    this.queue.process(async jobRedis => {
      this.logger.log(
        `Execution du job ${jobRedis.id} de type ${jobRedis.data.type}`
      )
      const job: JobPlanner.Job<JobPlanner.JobContent> = {
        executionDate: jobRedis.data.date,
        type: jobRedis.data.type,
        content: jobRedis.data.contenu
      }
      return handle(job)
    })
  }

  async isQueueReady(): Promise<Bull.Queue> {
    return this.queue.isReady()
  }

  async disconnect(): Promise<void> {
    await this.queue.close()
  }

  async createCronJob(cron: JobPlanner.CronJob): Promise<void> {
    await this.queue.add(cron, {
      jobId: cron.type,
      repeat: {
        cron: cron.expression,
        tz: CRON_TIMEZONE,
        startDate: cron.executionStartDate
      }
    })
  }

  async deleteCronJobs(): Promise<void> {
    const repeatableJobs = await this.queue.getRepeatableJobs()
    for (const job of repeatableJobs) {
      await this.queue.removeRepeatable({
        cron: job.cron,
        tz: job.tz,
        jobId: job.id
      })
    }
  }

  async deleteOldJobs(): Promise<number> {
    const aWeekAgo = Duration.fromObject({ day: 7 }).toMillis()
    const jobs = await this.queue.clean(aWeekAgo, 'completed')
    return jobs.length
  }

  async deleteJobsWithPattern(pattern: string): Promise<void> {
    await this.queue.removeJobs(`*${pattern}*`)
  }

  async isRunning(jobType: JobPlanner.JobType): Promise<boolean> {
    const activeJobs = await this.queue.getActive()
    return activeJobs.filter(job => job.data.type === jobType).length > 1
  }
}
