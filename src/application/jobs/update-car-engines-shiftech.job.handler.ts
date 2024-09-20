import { Inject, Injectable } from '@nestjs/common'
import { JobPlanner, ProcessJobType } from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { JobHandler } from '../types/job-handler'
import { Job } from '../types/job'
import { Scraper, ScraperRepositoryToken } from '../../domain/scraper'
import {
  CarEngineDto,
  CarEngineSqlModel
} from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { AsSql } from '../../infrastructure/sequelize/types'
import * as uuid from 'uuid'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { cleanString, fromNameToId } from '../helpers'
import { Fuel } from '../../domain/car-model'
import { ShiftechScrapedData } from './scraps/scrap-shiftech.job.handler'

@Injectable()
@ProcessJobType(JobPlanner.JobType.UPDATE_CAR_ENGINES_SHIFTECH)
export class UpdateCarEnginesShiftechJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    @Inject(ScraperRepositoryToken)
    private readonly scraperRepository: Scraper.Repository
  ) {
    super(JobPlanner.JobType.UPDATE_CAR_ENGINES_SHIFTECH)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    let skippedMakes: string = ''

    try {
      const carEnginesBR = await this.scraperRepository.get<
        ShiftechScrapedData[]
      >(Scraper.Category.CAR_ENGINE, Scraper.Site.SHIFTECH)

      const savedMakes = await CarMakeSqlModel.findAll()

      for (const carEngine of carEnginesBR) {
        const givenMakeId = fromNameToId(
          carEngine.make.replace('Landrover', 'Land Rover')
        )
        const makeId = savedMakes.find(make => make.id === givenMakeId)?.id
        if (!makeId) {
          skippedMakes += `${carEngine.make}, `
          continue
        }

        const engineName = cleanString(carEngine.engineName)

        const carEngineSqlModel: Partial<AsSql<CarEngineDto>> = {
          id: uuid.v4(),
          makeId,
          model: cleanString(carEngine.model),
          type: cleanString(carEngine.type),
          fromYear: cleanString(carEngine.year),
          engineName,
          cylinder: extractCylinder(engineName),
          fuel: dictFuelMapping[cleanString(carEngine.fuel)],
          hp: extractHP(carEngine.hp) || undefined,
          hpStage1: extractHP(carEngine.hpStage1) || undefined,
          hpStage2: extractHP(carEngine.hpStage2) || undefined,
          torque: extractTorque(carEngine.torque) || undefined,
          torqueStage1: extractTorque(carEngine.torqueStage1) || undefined,
          torqueStage2: extractTorque(carEngine.torqueStage2) || undefined,
          urlSourceShiftech: cleanString(carEngine.urlSource),
          imageUrl: carEngine.modelImg
            ? cleanString(carEngine.modelImg)
            : undefined,
          updatedAt: this.dateService.nowJs()
        }

        await CarEngineSqlModel.upsert(carEngineSqlModel, {
          conflictFields: ['url_source_shiftech']
        })
      }
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
      result: {
        skippedMakes
      }
    }
  }
}

function extractCylinder(inputString: string): string | null {
  const match = inputString.match(/\d\.\d/)
  return match ? match[0] : null
}

function extractHP(inputString: string | null): number | null {
  if (!inputString) return null
  const hp = Number(
    cleanString(
      inputString
        .toString()
        .replace('ch', '')
        .replace('Ch', '')
        .replace('CH', '')
        .replace('cH', '')
    )
  )
  return isNaN(hp) ? null : hp
}

function extractTorque(inputString: string | null): number | null {
  if (!inputString) return null
  const hp = Number(
    cleanString(
      inputString
        .toString()
        .replace('Nm', '')
        .replace('NM', '')
        .replace('nm', '')
        .replace('nM', '')
    )
  )
  return isNaN(hp) ? null : hp
}

const dictFuelMapping: { [key: string]: Fuel } = {
  petrol: Fuel.ESSENCE,
  diesel: Fuel.DIESEL,
  Hybrid: Fuel.HYBRID,
  gaz: Fuel.GAZ,
  gas: Fuel.GAZ,
  micro_hybrid_petrol: Fuel.ESSENCE_MICRO_HYBRID,
  mild_hybrid_petrol: Fuel.ESSENCE_MICRO_HYBRID,
  micro_hybrid_diesel: Fuel.DIESEL_MICRO_HYBRID,
  mild_hybrid_diesel: Fuel.DIESEL_MICRO_HYBRID,
  hybrid_diesel: Fuel.DIESEL_HYBRID,
  electric: Fuel.ELECTRIQUE,
  hybrid_petrol: Fuel.ESSENCE_HYBRID,
  ethanol: Fuel.ETHANOL,
  e85: Fuel.ETHANOL,
  hydrogen: Fuel.HYDROGEN
}
