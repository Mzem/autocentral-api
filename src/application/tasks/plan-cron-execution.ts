import { Inject, Injectable } from '@nestjs/common'
import { JobPlannerRepositoryToken, JobPlanner } from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { emptySuccess, Result } from '../../utils/result/result'
import { CommandHandler } from '../types/command-handler'
import { Command } from '../types/command'

export interface PlanCronExecutionCommand extends Command {
  jobType: JobPlanner.JobType
  executionDate?: string
}

@Injectable()
export class PlanCronExecutionCommandHandler extends CommandHandler<
  PlanCronExecutionCommand,
  void
> {
  constructor(
    @Inject(JobPlannerRepositoryToken)
    private jobPlannerRepository: JobPlanner.Repository,
    private dateService: DateService
  ) {
    super('PlanCronExecutionCommandHandler')
  }

  async handle(command: PlanCronExecutionCommand): Promise<Result> {
    const job: JobPlanner.Job<undefined> = {
      executionDate: command.executionDate
        ? new Date(command.executionDate)
        : this.dateService.nowJs(),
      type: command.jobType,
      content: undefined
    }
    await this.jobPlannerRepository.createJob(job)
    return emptySuccess()
  }

  async authorize(): Promise<Result> {
    return emptySuccess()
  }

  async monitor(): Promise<void> {
    return
  }
}
