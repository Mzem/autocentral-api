import { Injectable } from '@nestjs/common'
import { Job } from 'bull'
import { JobPlanner, ProcessJobType } from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { JobHandler } from '../types/job-handler'
import { CarPostSqlModel } from '../../infrastructure/sequelize/models/car-post.sql-model'
import { Op } from 'sequelize'

@Injectable()
@ProcessJobType(JobPlanner.JobType.CLEAN_CAR_POSTS)
export class CleanCarPostsJobHandler extends JobHandler<Job> {
  constructor(private dateService: DateService) {
    super(JobPlanner.JobType.CLEAN_CAR_POSTS)
  }

  async handle(): Promise<JobPlanner.Stats> {
    let error
    let nbDeletedCarPosts = 0
    const now = this.dateService.now()

    try {
      nbDeletedCarPosts = await CarPostSqlModel.destroy({
        where: {
          publishedAt: {
            [Op.lt]: now.minus({ days: 6 }).toJSDate()
          }
        }
      })
    } catch (e) {
      error = e
    }

    return {
      jobType: this.jobType,
      errors: 0,
      success: !error,
      executionDate: now,
      executionTime: DateService.countExecutionTime(now),
      result: error ?? { nbDeletedCarPosts },
      error
    }
  }
}
