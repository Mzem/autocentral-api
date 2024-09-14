import { Inject, Injectable } from '@nestjs/common'
import { CommandHandler } from '../types/command-handler'
import { Command } from '../types/command'
import { emptySuccess, Result } from '../../utils/result/result'
import {
  JobPlanner,
  JobPlannerRepositoryToken,
  JobPlannerService
} from '../../domain/job-planner'

@Injectable()
export class InitCronsCommandHandler extends CommandHandler<Command, void> {
  constructor(
    private jobPlannerService: JobPlannerService,
    @Inject(JobPlannerRepositoryToken)
    private jobPlannerRepository: JobPlanner.Repository
  ) {
    super('InitCronsCommandHandler')
  }

  async handle(): Promise<Result> {
    await this.jobPlannerRepository.deleteCronJobs()
    await this.jobPlannerService.planCronJobs()
    return emptySuccess()
  }
}
