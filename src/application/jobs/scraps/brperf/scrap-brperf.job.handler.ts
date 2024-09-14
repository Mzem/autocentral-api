import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import * as cheerio from 'cheerio'
import { firstValueFrom } from 'rxjs'
import { JobPlanner, ProcessJobType } from '../../../../domain/job-planner'
import { Scraper, ScraperRepositoryToken } from '../../../../domain/scraper'
import { DateService } from '../../../../utils/date.service'
import { Job } from '../../../types/job'
import { JobHandler } from '../../../types/job-handler'
import { normalizeSpaces, removeHelperStrings } from './helpers'
import { Element } from 'domhandler'
import { processCarEngine } from './parse-car-engine'
import { parseTypeDatesYears } from './mappers'

const SITE = 'https://www.br-performance.fr/brp-paris/'

export interface BRPerfScrapedData {
  make: string | null
  model: string
  car_title_name: string
  type: string | null
  production_start_year: string
  production_end_year: string
  engine_name: string
  fuel: string
  hp: string
  hp_remap: string
  torque: string
  torque_remap: string
  URL_SOURCE: string
}

@Injectable()
@ProcessJobType(JobPlanner.JobType.SCRAP_BRPERF)
export class ScrapBRPerfJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    private httpService: HttpService,
    @Inject(ScraperRepositoryToken)
    private readonly scraperRepository: Scraper.Repository
  ) {
    super(JobPlanner.JobType.SCRAP_BRPERF)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    try {
      const jsonResult = await this.scrap()

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

  private async scrap(): Promise<BRPerfScrapedData[]> {
    const urlCarMakes = SITE + 'reprogrammation/1-voitures'

    // Fetch makes and their URLs
    const { makeUrls, makeNames } = await this.getCarMakes(urlCarMakes)
    this.logger.debug('GOT CAR MAKES')
    this.logger.debug(JSON.stringify(makeUrls))
    this.logger.debug(JSON.stringify(makeNames))
    const scrapedData: BRPerfScrapedData[] = []

    // Loop through each make
    for (let i = 0; i < makeUrls.length; i++) {
      const makeUrl = makeUrls[i]
      const makeName = makeNames[i]
      this.logger.debug('looping')
      this.logger.debug(makeName)

      // Fetch car models for the brand
      const { allHrefBrandModel, allModelNames } = await this.getCarModels(
        SITE + makeUrl
      )

      // Loop through each car model
      for (let j = 0; j < allHrefBrandModel.length; j++) {
        const urlCarModel = allHrefBrandModel[j]
        const modelName = allModelNames[j]

        // Fetch all car types for the model
        const {
          allHrefBrandTypeModel,
          allTypesNames,
          h2TagsBrandModelType,
          h3TagsBrandModelType
        } = await this.getAllTypesEachModelCar(
          SITE + urlCarModel,
          allHrefBrandModel,
          allModelNames
        )

        // Loop through each car type
        for (let k = 0; k < allHrefBrandTypeModel.length; k++) {
          const urlCarType = allHrefBrandTypeModel[k]
          let carTitleName = allTypesNames[k]

          // Process car engine data for the car type
          const subListDataCars = await processCarEngine(
            urlCarType,
            SITE,
            h2TagsBrandModelType,
            h3TagsBrandModelType,
            this.httpService
          )

          // Loop through each car document and enrich the data
          for (const carDocument of subListDataCars) {
            const cleanModelName = makeName
              ? modelName.replace(makeName, '').trim()
              : modelName.trim()
            carTitleName = carTitleName.replace(cleanModelName, '').trim()
            carTitleName = makeName
              ? carTitleName.replace(makeName, '').trim()
              : carTitleName.trim()

            // Parse vehicle type and production years
            const [vehicleType, startYear, endYear] =
              parseTypeDatesYears(carTitleName)

            carDocument.make = makeName ? normalizeSpaces(makeName) : makeName
            carDocument.model = normalizeSpaces(cleanModelName)
            carDocument.car_title_name = carTitleName
            carDocument.type = vehicleType
            carDocument.production_start_year = startYear
            carDocument.production_end_year = endYear

            // Append the processed data
            scrapedData.push(carDocument)
          }
        }
      }
    }

    return scrapedData
  }

  private async getCarMakes(carMakesURL: string): Promise<CarMakes> {
    this.logger.debug('Getting Car Makes')
    try {
      const carMakesResponse = await firstValueFrom(
        this.httpService.get(carMakesURL)
      )
      const $ = cheerio.load(carMakesResponse.data)

      const divTagBrand = $('div.twentyfour.columns.bigpadding')

      if (divTagBrand.length > 0) {
        const aTagsBrand = divTagBrand.find('a').toArray()

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return getCarsModelsUrlsNames(aTagsBrand)
      } else {
        this.logger.warn(
          "No div with class 'twentyfour columns bigpadding' found."
        )
        return { makeUrls: [], makeNames: [] }
      }
    } catch (error) {
      this.logger.error('Error fetching car brand data:', error)
      return { makeUrls: [], makeNames: [] }
    }
  }

  private async getCarModels(
    urlCarBrand: string
  ): Promise<{ allHrefBrandModel: string[]; allModelNames: string[] }> {
    try {
      // Make HTTP request to get the HTML content
      const response = await firstValueFrom(this.httpService.get(urlCarBrand))

      // Load the HTML into cheerio for parsing
      const $ = cheerio.load(response.data)

      // Find the <ul> element with the class "content"
      const ulTagBrandModel = $('ul.content')

      // Initialize arrays to store hrefs and model names
      const allHrefBrandModel: string[] = []
      const allModelNames: string[] = []

      // Find all <li> elements inside the <ul>
      ulTagBrandModel.find('li').each((_index, liTag) => {
        // For each <li>, find all <a> tags
        $(liTag)
          .find('a')
          .each((_i, aTag) => {
            const href = $(aTag).attr('href')
            const title = $(aTag).attr('title')

            // Add the href and title to the respective arrays
            if (href) allHrefBrandModel.push(href)
            if (title) allModelNames.push(title)
          })
      })

      return { allHrefBrandModel, allModelNames }
    } catch (error) {
      this.logger.error('Error fetching car models:', error)
      return { allHrefBrandModel: [], allModelNames: [] }
    }
  }

  private async getAllTypesEachModelCar(
    urlModelCar: string,
    allHrefBrandModel: string[],
    allModelNames: string[]
  ): Promise<{
    allHrefBrandTypeModel: string[]
    allTypesNames: string[]
    h2TagsBrandModelType: string[]
    h3TagsBrandModelType: string[]
  }> {
    try {
      // Fetch the HTML content from the URL
      const response = await firstValueFrom(this.httpService.get(urlModelCar))
      const htmlContentBrandModelType = response.data

      // Load HTML into cheerio for parsing
      const $ = cheerio.load(htmlContentBrandModelType)

      // Find <ul> tags with the class "content"
      const ulTagBrandModelType = $('ul.content')

      // Extract the text of all <h2> and <h3> tags
      const h2TagsBrandModelType: string[] = $('h2')
        .map((_i, el) => $(el).text())
        .get()
      const h3TagsBrandModelType: string[] = $('h3')
        .map((_i, el) => $(el).text())
        .get()

      // Flatten the <li> tags inside <ul> tags with class "content"
      const flattenedLiListBrandModelType: Element[] = []
      ulTagBrandModelType.each((_i, ul) => {
        $(ul)
          .find('li')
          .each((_j, li) => {
            flattenedLiListBrandModelType.push(li)
          })
      })

      // Initialize arrays to store the hrefs and titles
      const allHrefBrandTypeModel: string[] = []
      const allTypesNames: string[] = []

      // Loop through <li> tags and extract <a> tags href and title attributes
      flattenedLiListBrandModelType.forEach(liTag => {
        $(liTag)
          .find('a')
          .each((_i, aTag) => {
            const href = $(aTag).attr('href')
            const title = $(aTag).attr('title')

            if (href) allHrefBrandTypeModel.push(href)
            if (title) allTypesNames.push(title)
          })
      })

      // Call the helper function to remove helper strings
      const cleanedTypesNames = removeHelperStrings(
        allModelNames,
        allTypesNames
      )
      const cleanedHrefBrandTypeModel = removeHelperStrings(
        allHrefBrandModel,
        allHrefBrandTypeModel
      )

      // Return the final result
      return {
        allHrefBrandTypeModel: cleanedHrefBrandTypeModel,
        allTypesNames: cleanedTypesNames,
        h2TagsBrandModelType,
        h3TagsBrandModelType
      }
    } catch (error) {
      this.logger.error('Error fetching model car types:', error)
      return {
        allHrefBrandTypeModel: [],
        allTypesNames: [],
        h2TagsBrandModelType: [],
        h3TagsBrandModelType: []
      }
    }
  }
}

interface CarMakes {
  makeUrls: string[]
  makeNames: Array<string | null>
}

type MyElement = {
  attribs: {
    [key: string]: string
  }
  children: MyElement[]
  name?: string
}

function getCarsModelsUrlsNames(aTagsBrand: MyElement[]): CarMakes {
  const makeUrls: string[] = []
  const makeNames: Array<string | null> = []

  aTagsBrand.forEach(a => {
    const href = a.attribs['href']
    if (href) {
      makeUrls.push(href)
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const imgTag = a.children.find(child => child.name === 'img')
    const title = imgTag && imgTag.attribs ? imgTag.attribs['title'] : null
    makeNames.push(title)
  })

  return { makeUrls, makeNames }
}
