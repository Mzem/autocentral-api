import * as cheerio from 'cheerio'

import {
  removeHelperStrings,
  convertFromHtmlToDict,
  parseCarTypesNames,
  normalizeSpaces,
  removeDuplicatesPreserveOrder
} from './helpers'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { BRPerfScrapedData } from './scrap-brperf.job.handler'

const dictFuelMapping: { [key: string]: string } = {
  Gasoline: 'Essence',
  Diesel: 'Diesel',
  Hybrid: 'Hybrid',
  Gas: 'Gaz',
  'Petrol Micro Hybrid': 'Essence Micro Hybrid',
  'Petrol Micro Hybrid 48V': 'Essence Micro Hybrid',
  'Diesel Micro Hybrid': 'Diesel Micro Hybrid',
  'Diesel Micro Hybrid 48V': 'Diesel Micro Hybrid',
  'Diesel Hybrid': 'Diesel Hybrid',
  Electric: 'Electrique',
  'Petrol Hybrid': 'Essence Hybrid',
  'Multifuel Essence / E85': 'Ethanol',
  Hydrogen: 'Hydrogen'
}

export async function processCarEngine(
  hrefBrandTypeModel: string,
  baseUrlWebsite: string,
  h2TagsBrandModelType: string[],
  h3TagsBrandModelType: string[],
  httpsService: HttpService
): Promise<BRPerfScrapedData[]> {
  const carBrandModelTypeEngineCategory = await firstValueFrom(
    httpsService.get(baseUrlWebsite + hrefBrandTypeModel)
  )
  const $ = cheerio.load(carBrandModelTypeEngineCategory.data)

  const ulTagsByType = $('ul.content.fr')
  const h2TagsBrandModelTypeEngineCategory = $('h2')
    .map((_, tag) => $(tag).text())
    .get()
  const h3TagsBrandModelTypeEngineCategory = $('h3')
    .map((_, tag) => $(tag).text())
    .get()

  const h2TagsClean = removeHelperStrings(
    h2TagsBrandModelType,
    h2TagsBrandModelTypeEngineCategory
  )
  const h3TagsClean = removeHelperStrings(
    h3TagsBrandModelType,
    h3TagsBrandModelTypeEngineCategory
  )

  const listEachCarData: BRPerfScrapedData[] = []

  for (let i = 0; i < h2TagsClean.length; i++) {
    const h2Tag = h2TagsClean[i]
    const h3Tag = h3TagsClean[i]
    const categoryType = ulTagsByType[i]

    const aTagsSubCategory = $(categoryType).find('a')
    const hrefsSubCategory = removeDuplicatesPreserveOrder(
      aTagsSubCategory.map((_, a) => $(a).attr('href')).get()
    )
    const namesSubCategory = parseCarTypesNames(aTagsSubCategory)

    for (let j = 0; j < hrefsSubCategory.length; j++) {
      const technicalCategoryUrl = hrefsSubCategory[j]
      const categoryName = namesSubCategory[j]

      const data = await processTableData(
        baseUrlWebsite,
        technicalCategoryUrl,
        h2Tag,
        h3Tag,
        httpsService
      )

      if (data) {
        data.engine_name = normalizeSpaces(categoryName)
        listEachCarData.push(data)
      }
    }
  }

  return listEachCarData
}

// Function to process table data from a category
async function processTableData(
  baseUrlWebsite: string,
  technicalCategoryUrl: string,
  _h2Tag: string,
  h3Tag: string,
  httpsService: HttpService
): Promise<BRPerfScrapedData | null> {
  try {
    const carCategoryTechnical = await firstValueFrom(
      httpsService.get(baseUrlWebsite + technicalCategoryUrl)
    )

    if (carCategoryTechnical.status === 200) {
      const $ = cheerio.load(carCategoryTechnical.data)
      const tableCarCategoryTechnical = $('div.content.nopadding')

      const data = convertFromHtmlToDict(tableCarCategoryTechnical)
      data.fuel = dictFuelMapping[h3Tag]
      data.URL_SOURCE = baseUrlWebsite + technicalCategoryUrl

      return data as unknown as BRPerfScrapedData
    } else {
      return null
    }
  } catch (error) {
    this.logger.error('Error fetching data:', error)
    return null
  }
}
