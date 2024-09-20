import { Inject, Injectable } from '@nestjs/common'
import { JobPlanner, ProcessJobType } from '../../domain/job-planner'
import { DateService } from '../../utils/date.service'
import { JobHandler } from '../types/job-handler'
import { Job } from '../types/job'
import { Scraper, ScraperRepositoryToken } from '../../domain/scraper'
import { BRPerfScrapedData } from './scraps/scrap-brperf.job.handler'
import {
  CarEngineDto,
  CarEngineSqlModel
} from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { AsSql } from '../../infrastructure/sequelize/types'
import * as uuid from 'uuid'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { cleanString, fromNameToId } from '../helpers'
import { Fuel } from '../../domain/car-model'

@Injectable()
@ProcessJobType(JobPlanner.JobType.UPDATE_CAR_ENGINES_BRPERF)
export class UpdateCarEnginesBRPerfJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    @Inject(ScraperRepositoryToken)
    private readonly scraperRepository: Scraper.Repository
  ) {
    super(JobPlanner.JobType.UPDATE_CAR_ENGINES_BRPERF)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    let skippedMakes: string = ''

    try {
      const carEnginesBR = await this.scraperRepository.get<
        BRPerfScrapedData[]
      >(Scraper.Category.CAR_ENGINE, Scraper.Site.BRPERF)

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
        const model = cleanString(carEngine.model.replace(carEngine.make, ''))
        const typeYears = cleanString(
          carEngine.typeYears.replace(carEngine.model, '')
        )
        const typeYearsSplit = typeYears.split(' ')
        const toYear = typeYearsSplit[typeYearsSplit.length - 1]
        const fromYear = typeYearsSplit[typeYearsSplit.length - 2]
        const type =
          typeYearsSplit.length > 2
            ? cleanString(typeYears.replace(fromYear, '').replace(toYear, ''))
            : null
        const engineName = cleanString(carEngine.engineName)

        const carEngineSqlModel: Partial<AsSql<CarEngineDto>> = {
          id: uuid.v4(),
          makeId,
          model,
          type,
          fromYear: isNaN(Number(fromYear)) ? null : Number(fromYear),
          toYear: isNaN(Number(toYear)) ? null : Number(toYear),
          engineName,
          cylinder: extractCylinder(engineName),
          fuel: dictFuelMapping[carEngine.fuel.trim()],
          hp: extractHP(carEngine.hp) || undefined,
          hpStage1: extractHP(carEngine.hpRemap) || undefined,
          torque: extractTorque(carEngine.torque) || undefined,
          torqueStage1: extractTorque(carEngine.torqueRemap) || undefined,
          urlSourceBRPerf: cleanString(carEngine.urlSource),
          updatedAt: this.dateService.nowJs()
        }

        await CarEngineSqlModel.upsert(carEngineSqlModel, {
          conflictFields: ['urlSourceBRPerf']
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
      executionTime: DateService.countExecutionTime(now),
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
  Gasoline: Fuel.ESSENCE,
  Diesel: Fuel.DIESEL,
  Hybrid: Fuel.HYBRID,
  Gas: Fuel.GAZ,
  'Petrol Micro Hybrid': Fuel.ESSENCE_MICRO_HYBRID,
  'Petrol Micro Hybrid 48V': Fuel.ESSENCE_MICRO_HYBRID,
  'Diesel Micro Hybrid': Fuel.DIESEL_MICRO_HYBRID,
  'Diesel Micro Hybrid 48V': Fuel.DIESEL_MICRO_HYBRID,
  'Diesel Hybrid': Fuel.DIESEL_HYBRID,
  Electric: Fuel.ELECTRIQUE,
  'Petrol Hybrid': Fuel.ESSENCE_HYBRID,
  'Multifuel Essence / E85': Fuel.ETHANOL,
  Hydrogen: Fuel.HYDROGEN
}
