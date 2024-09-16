import { Inject, Injectable } from '@nestjs/common'
import { JobPlanner, ProcessJobType } from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { JobHandler } from '../types/job-handler'
import { Job } from '../types/job'
import { Scraper, ScraperRepositoryToken } from '../../domain/scraper'

@Injectable()
@ProcessJobType(JobPlanner.JobType.UPDATE_CAR_ENGINES)
export class UpdateCarEnginesJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    @Inject(ScraperRepositoryToken)
    private readonly scraperRepository: Scraper.Repository
  ) {
    super(JobPlanner.JobType.UPDATE_CAR_ENGINES)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error

    try {
      const _carEnginesBR = this.scraperRepository.get(
        Scraper.Category.CAR_ENGINE,
        Scraper.Site.BRPERF
      )
    } catch (e) {
      error = e
      this.logger.error(e)
    }

    return {
      jobType: this.jobType,
      errors: 0,
      success: !error,
      executionDate: now,
      executionTime: now.diffNow().milliseconds * -1,
      result: {}
    }
  }
}

function _extractCylinder(inputString: string): string | null {
  const match = inputString.toString().match(/\d\.\d/)
  return match ? match[0] : null
}
