import { Inject, Injectable } from '@nestjs/common'
import * as uuid from 'uuid'
import { Fuel } from '../../domain/car-model'
import { JobPlanner, ProcessJobType } from '../../domain/job-planner'
import { Scraper, ScraperRepositoryToken } from '../../domain/scraper'
import {
  CarEngineDto,
  CarEngineSqlModel
} from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { AsSql } from '../../infrastructure/sequelize/types'
import { DateService } from '../../utils/date.service'
import { cleanString, fromNameToId, fromStringToNumber } from '../helpers'
import { Job } from '../types/job'
import { JobHandler } from '../types/job-handler'
import { BRPerfScrapedData } from './scraps/scrap-brperf.job.handler'

export const makeIdsBRPerf = [
  'byd',
  'geely',
  'jac',
  'mg',
  'mahindra',
  'tata',
  'tesla'
]

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
    const skippedMakes = []

    try {
      const carEnginesBR = await this.scraperRepository.get<
        BRPerfScrapedData[]
      >(Scraper.Category.CAR_ENGINE, Scraper.Site.BRPERF)

      for (const carEngine of carEnginesBR) {
        const makeId = fromNameToId(
          carEngine.make.replace('Landrover', 'Land Rover')
        )
        if (!makeIdsBRPerf.includes(makeId)) {
          skippedMakes.push(carEngine.make)
          continue
        }

        this.logger.debug('handling make ' + makeId)
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

        const urlSourceBRPerf = cleanString(carEngine.urlSource)
        const existingRecord = await CarEngineSqlModel.findOne({
          where: { urlSourceBRPerf }
        })

        const carEngineSqlModel: Partial<AsSql<CarEngineDto>> = {
          id: existingRecord?.id || uuid.v4(),
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
          urlSourceBRPerf,
          updatedAt: this.dateService.nowJs()
        }

        await CarEngineSqlModel.upsert(carEngineSqlModel, {
          conflictFields: ['url_source_brperf']
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
        skippedMakes: Array.from(new Set(skippedMakes))
      }
    }
  }
}

export function extractCylinder(inputString: string): string | null {
  const match = inputString.match(/\d\.\d/)
  return match ? match[0] : null
}

export function extractCylinderFromDisplacement(
  inputString?: string
): string | null {
  if (!inputString) return null

  const nbDisp = fromStringToNumber(inputString.substring(0, 4))

  if (isNaN(nbDisp)) {
    throw new Error('Invalid displacement number format.')
  }

  if (nbDisp.toString().length !== 4 && nbDisp.toString().length !== 3) {
    throw new Error('Invalid displacement length format.')
  }

  const final = Math.round(nbDisp / 100)

  if (nbDisp >= 901) {
    return `${final.toString().charAt(0)}.${final.toString().charAt(1)}`
  } else {
    return `0.${final.toString().charAt(0)}`
  }
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
