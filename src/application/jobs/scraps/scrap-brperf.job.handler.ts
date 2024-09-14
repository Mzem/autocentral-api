import { Inject, Injectable } from '@nestjs/common'
import { JobPlanner, ProcessJobType } from '../../../domain/job-planner'
import { DateService } from '../../../utils/date.service'
import { JobHandler } from '../../types/job-handler'
import { Job } from '../../types/job'
import { Scraper, ScraperRepositoryToken } from '../../../domain/scraper'

@Injectable()
@ProcessJobType(JobPlanner.JobType.SCRAP_BRPERF)
export class ScrapBRPerfJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    @Inject(ScraperRepositoryToken)
    private readonly scraperRepository: Scraper.Repository
  ) {
    super(JobPlanner.JobType.SCRAP_BRPERF)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    try {
      // SCRAP DATA FROM SITE BR PERF
      const jsonResult = [{}]

      await this.scraperRepository.save(
        Scraper.Category.CAR_ENGINE,
        Scraper.Site.BRPERF,
        jsonResult
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
