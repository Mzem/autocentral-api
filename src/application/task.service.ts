import { Inject, Injectable, Logger } from '@nestjs/common'
import { JobPlanner, JobPlannerRepositoryToken } from '../domain/job-planner'
import { PlanCronExecutionCommandHandler } from './tasks/plan-cron-execution'
import { InitCronsCommandHandler } from './tasks/init-crons'

export enum Task {
  DUMMY_JOB = 'DUMMY_JOB',
  INIT_CRONS = 'INIT_CRONS'
}

@Injectable()
export class TaskService {
  private logger: Logger = new Logger('TaskService')

  constructor(
    @Inject(JobPlannerRepositoryToken)
    private jobPlannerRepository: JobPlanner.Repository,
    private initCronsCommandHandler: InitCronsCommandHandler,
    private planCronExecutionCommandHandler: PlanCronExecutionCommandHandler
  ) {}

  async handle(task: Task, date?: string): Promise<void> {
    this.logger.log(task)
    const isCronJob = task in JobPlanner.JobType
    try {
      if (isCronJob) {
        await this.planCronExecutionCommandHandler.execute({
          jobType: task as unknown as JobPlanner.JobType,
          executionDate: date
        })
      } else {
        switch (task) {
          case Task.DUMMY_JOB:
            await this.jobPlannerRepository.createJob({
              executionDate: new Date(),
              type: JobPlanner.JobType.FAKE,
              content: { message: 'dummy job' }
            })
            break
          case Task.INIT_CRONS:
            await this.initCronsCommandHandler.execute({})
            break
          default:
            this.logger.log(
              `Unknown task ${task}, possible tasks: ${Object.values(Task)}`
            )
        }
      }
    } catch (e) {
      this.logger.error(e)
    }
  }
}
