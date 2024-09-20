import { Inject, Injectable } from '@nestjs/common'
import {
  JobPlanner,
  JobPlannerRepositoryToken,
  ProcessJobType
} from '../../../domain/job-planner'
import { Scraper, ScraperRepositoryToken } from '../../../domain/scraper'
import { ShiftechApiClient } from '../../../infrastructure/clients/shiftech-api-client'
import { CarMakeSqlModel } from '../../../infrastructure/sequelize/models/car-make.sql-model'
import { DateService } from '../../../utils/date.service'
import { Job } from '../../types/job'
import { JobHandler } from '../../types/job-handler'
import { fromNameToId } from '../../helpers'

let errors = 0

export interface ShiftechScrapedData {
  make: string
  model: string
  modelImg: string | null
  type: string
  year: string
  fuel: string
  engineName: string
  hp: string | null
  hpStage1: string | null
  hpStage2: string | null
  torque: string | null
  torqueStage1: string | null
  torqueStage2: string | null
  urlSource: string
}

@Injectable()
@ProcessJobType(JobPlanner.JobType.SCRAP_SHIFTECH)
export class ScrapShiftechJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    private shiftechApiClient: ShiftechApiClient,
    @Inject(ScraperRepositoryToken)
    private readonly scraperRepository: Scraper.Repository,
    @Inject(JobPlannerRepositoryToken)
    private readonly jobPlannerRepository: JobPlanner.Repository
  ) {
    super(JobPlanner.JobType.SCRAP_SHIFTECH)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    try {
      const scrapedDataJson = await this.scrap()

      await this.scraperRepository.save(
        Scraper.Category.CAR_ENGINE,
        Scraper.Site.SHIFTECH,
        scrapedDataJson
      )

      await this.jobPlannerRepository.createJob({
        executionDate: this.dateService.nowJs(),
        type: JobPlanner.JobType.UPDATE_CAR_ENGINES_SHIFTECH,
        content: undefined
      })
    } catch (e) {
      error = e
      this.logger.error(e)
    }

    return {
      jobType: this.jobType,
      errors,
      success: !error,
      executionDate: now,
      executionTime: DateService.countExecutionTime(now),
      result: {}
    }
  }

  private async scrap(): Promise<ShiftechScrapedData[]> {
    const scrapedData: ShiftechScrapedData[] = []

    this.logger.debug('GETTING CAR MAKES')
    const carMakes = await this.shiftechApiClient.getMakes()
    const savedMakeIds = (await CarMakeSqlModel.findAll()).map(
      savedMake => savedMake.id
    )
    const makesToHandle = carMakes.hits.filter(make => {
      return savedMakeIds.includes(fromNameToId(make.brand.name))
    })

    for (const carMake of makesToHandle) {
      try {
        this.logger.debug('Getting models for ' + carMake.brand.name)

        const carModels = await this.shiftechApiClient.getModels(
          carMake.brand.slug
        )

        for (const carModel of carModels.hits) {
          this.logger.debug('GETTING TYPES')
          const modelYears = await this.shiftechApiClient.getTypeYears(
            carMake.brand.slug,
            carModel.model.slug
          )

          for (const modelYear of modelYears.hits) {
            this.logger.debug('GETTING ENGINES')
            const engines = await this.shiftechApiClient.getEngines(
              carMake.brand.slug,
              carModel.model.slug,
              modelYear.version.slug
            )

            for (const engine of engines.hits) {
              this.logger.debug('GETTING REMAP')
              const remap = await this.shiftechApiClient.getRemap(
                carMake.brand.slug,
                carModel.model.slug,
                modelYear.version.slug,
                engine.engine.slug
              )
              scrapedData.push({
                make: carMake.brand.name,
                model: carModel.model.name,
                modelImg: carModel.model.image,
                type: modelYear.version.name,
                year: modelYear.version.year,
                fuel: engine.engine.fuel,
                engineName: engine.engine.name,
                hp: remap.remap.blocks[0]?.content.horsepower,
                hpStage1:
                  remap.remap.blocks[0]?.content.stages.find(
                    stage => stage.name === 'stage1'
                  )?.horsepowerTotal ?? null,
                hpStage2:
                  remap.remap.blocks[0]?.content.stages.find(
                    stage => stage.name === 'stage2'
                  )?.horsepowerTotal ?? null,
                torque: remap.remap.blocks[0]?.content.torque,
                torqueStage1:
                  remap.remap.blocks[0]?.content.stages.find(
                    stage => stage.name === 'stage1'
                  )?.torqueTotal ?? null,
                torqueStage2:
                  remap.remap.blocks[0]?.content.stages.find(
                    stage => stage.name === 'stage2'
                  )?.torqueTotal ?? null,
                urlSource: remap.urlSource
              })
            }
          }
        }
      } catch (e) {
        errors++
        this.logger.error(`Error for make ${carMake.brand.name} | ${e}`)
      }
    }

    return scrapedData
  }
}
