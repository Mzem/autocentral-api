import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import * as cheerio from 'cheerio'
import { Element } from 'domhandler'
import { firstValueFrom } from 'rxjs'
import {
  JobPlanner,
  JobPlannerRepositoryToken,
  ProcessJobType
} from '../../../domain/job-planner'
import { Scraper, ScraperRepositoryToken } from '../../../domain/scraper'
import { DateService } from '../../../utils/date.service'
import { Job } from '../../types/job'
import { JobHandler } from '../../types/job-handler'
import { CarMakeSqlModel } from '../../../infrastructure/sequelize/models/car-make.sql-model'
import { fromNameToId } from '../../helpers'

const SITE = 'https://www.br-performance.fr/brp-paris/'
let errors = 0

export interface BRPerfScrapedData {
  make: string
  model: string
  typeYears: string
  fuel: string
  engineName: string
  hp: string | null
  hpRemap: string | null
  torque: string | null
  torqueRemap: string | null
  urlSource: string
}

interface CarMake {
  url: string
  name: string
}
interface CarModel {
  url: string
  name: string
}
interface ModelYear {
  url: string
  name: string
}
interface CarEngine {
  url: string
  name: string
  fuel: string
}
interface Remap {
  hp: string | null
  hpRemap: string | null
  torque: string | null
  torqueRemap: string | null
}

@Injectable()
@ProcessJobType(JobPlanner.JobType.SCRAP_BRPERF)
export class ScrapBRPerfJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    private httpService: HttpService,
    @Inject(ScraperRepositoryToken)
    private readonly scraperRepository: Scraper.Repository,
    @Inject(JobPlannerRepositoryToken)
    private readonly jobPlannerRepository: JobPlanner.Repository
  ) {
    super(JobPlanner.JobType.SCRAP_BRPERF)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    try {
      const scrapedDataJson = await this.scrap()

      await this.scraperRepository.save(
        Scraper.Category.CAR_ENGINE,
        Scraper.Site.BRPERF,
        scrapedDataJson
      )

      await this.jobPlannerRepository.createJob({
        executionDate: this.dateService.nowJs(),
        type: JobPlanner.JobType.UPDATE_CAR_ENGINES_BRPERF,
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

  private async scrap(): Promise<BRPerfScrapedData[]> {
    const urlCarMakes = SITE + 'reprogrammation/1-voitures'

    const carMakes = await this.getCarMakes(urlCarMakes)
    const scrapedData: BRPerfScrapedData[] = []

    const savedMakeIds = (await CarMakeSqlModel.findAll()).map(
      savedMake => savedMake.id
    )
    const makesToHandle = carMakes.filter(make => {
      return savedMakeIds.includes(fromNameToId(make.name))
    })
    for (const carMake of makesToHandle) {
      this.logger.debug(carMake.name)

      const carModels = await this.getCarModels(SITE + carMake.url)

      for (const carModel of carModels) {
        const modelYears = await this.getYearsForEachCarModel(
          SITE + carModel.url
        )

        for (const modelYear of modelYears) {
          const engines: CarEngine[] = await this.getEngines(
            SITE + modelYear.url
          )

          for (const engine of engines) {
            const remap: Remap = await this.getRemap(SITE + engine.url)
            scrapedData.push({
              make: carMake.name,
              model: carModel.name,
              typeYears: modelYear.name,
              fuel: engine.fuel,
              engineName: engine.name,
              hp: remap.hp,
              hpRemap: remap.hpRemap,
              torque: remap.torque,
              torqueRemap: remap.torqueRemap,
              urlSource: SITE + engine.url
            })
          }
        }
      }
    }

    return scrapedData
  }

  private async getCarMakes(carMakesURL: string): Promise<CarMake[]> {
    this.logger.debug('Getting Car Makes')
    const carMakes: CarMake[] = []
    try {
      const carMakesResponse = await firstValueFrom(
        this.httpService.get(carMakesURL)
      )

      const $ = cheerio.load(carMakesResponse.data)

      const divTagMakes = $('div.twentyfour.columns.bigpadding')

      if (divTagMakes.length > 0) {
        const aTagsMakes = divTagMakes.find('a').toArray()

        aTagsMakes.forEach(a => {
          const href = a.attribs['href']
          const title = $(a).find('img')?.attr('title')

          if (href && title) {
            carMakes.push({ url: href, name: title })
          }
        })
      } else {
        this.logger.warn(
          "No div with class 'twentyfour columns bigpadding' found."
        )
      }
    } catch (error) {
      errors++
      this.logger.error('Error fetching car makes:', error)
    }
    return carMakes
  }

  private async getCarModels(carModelURL: string): Promise<CarModel[]> {
    this.logger.debug('Getting models')
    const carModels: CarModel[] = []
    try {
      const response = await firstValueFrom(this.httpService.get(carModelURL))
      const $ = cheerio.load(response.data)

      // Find the <ul> element with the class "content"
      const ulTagBrandModel = $('ul.content')

      // Find all <li> elements inside the <ul>
      ulTagBrandModel.find('li').each((_index, liTag) => {
        // For each <li>, find all <a> tags
        $(liTag)
          .find('a')
          .each((_i, aTag) => {
            const href = $(aTag).attr('href')
            const title = $(aTag).attr('title')

            if (href && title) {
              carModels.push({ url: href, name: title })
            }
          })
      })
    } catch (error) {
      errors++
      this.logger.error('Error fetching car models:', error)
    }
    return carModels
  }

  private async getYearsForEachCarModel(
    carModelURL: string
  ): Promise<ModelYear[]> {
    this.logger.debug('Getting years for model')
    const modelYears: ModelYear[] = []

    try {
      // Fetch the HTML content from the URL
      const response = await firstValueFrom(this.httpService.get(carModelURL))
      const html = response.data

      // Load HTML into cheerio for parsing
      const $ = cheerio.load(html)

      // Find <ul> tags with the class "content"
      const ulTagBrandModelType = $('ul.content')

      // Flatten the <li> tags inside <ul> tags with class "content"
      const flattenedLiListBrandModelType: Element[] = []
      ulTagBrandModelType.each((_i, ul) => {
        $(ul)
          .find('li')
          .each((_j, li) => {
            flattenedLiListBrandModelType.push(li)
          })
      })

      // Loop through <li> tags and extract <a> tags href and title attributes
      flattenedLiListBrandModelType.forEach(liTag => {
        $(liTag)
          .find('a')
          .each((_i, aTag) => {
            const href = $(aTag).attr('href')
            const title = $(aTag).attr('title')

            if (href && title) {
              modelYears.push({ url: href, name: title })
            }
          })
      })
    } catch (error) {
      errors++
      this.logger.error('Error fetching model years:', error)
    }
    return modelYears
  }

  private async getEngines(urlCarEngine: string): Promise<CarEngine[]> {
    this.logger.debug('Getting engines')
    const carEngines: CarEngine[] = []

    try {
      const response = await firstValueFrom(this.httpService.get(urlCarEngine))
      const $ = cheerio.load(response.data)

      $('header.small').each((_index, headerTag) => {
        const fuel = $(headerTag).find('h3').text().trim() // Extract fuel type from <h3>

        // Find the next <ul> element (containing car models)
        const ulTag = $(headerTag).next('ul.content.fr')

        $(ulTag)
          .find('li')
          .each((_liIndex, liTag) => {
            const firstATag = $(liTag).find('a').first()
            const name = $(firstATag).text().trim()
            const url = $(firstATag).attr('href')

            if (name && url) {
              carEngines.push({
                fuel,
                name,
                url
              })
            }
          })
      })
    } catch (error) {
      errors++
      this.logger.error('Error fetching engine: ' + error)
    }
    return carEngines
  }

  private async getRemap(urlRemap: string): Promise<Remap> {
    const remap: Remap = {
      hp: null,
      hpRemap: null,
      torque: null,
      torqueRemap: null
    }
    try {
      const response = await firstValueFrom(this.httpService.get(urlRemap))
      const $ = cheerio.load(response.data)
      const div = $('div.content.nopadding')

      const rows = div.find('tr')

      if (rows.length > 1 && rows.eq(1).find('td').length >= 3) {
        remap.hp = rows.eq(1).find('td').eq(0).text().trim()
        remap.hpRemap = rows.eq(1).find('td').eq(1).text().trim()
      }

      if (rows.length > 2 && rows.eq(2).find('td').length >= 3) {
        remap.torque = rows.eq(2).find('td').eq(0).text().trim()
        remap.torqueRemap = rows.eq(2).find('td').eq(1).text().trim()
      }
    } catch (error) {
      errors++
      this.logger.error('Error fetching data:', error)
    }
    return remap
  }
}
