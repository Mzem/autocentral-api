import { Inject, Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { Op, QueryTypes, Sequelize } from 'sequelize'
import { Source } from '../../../domain/car-post'
import { JobPlanner, ProcessJobType } from '../../../domain/job-planner'
import { Merchant } from '../../../domain/merchant'
import { Region } from '../../../domain/region'
import { AutomobiletnApiClient } from '../../../infrastructure/clients/automobiletn-api-client'
import {
  CarPostDto,
  CarPostSqlModel
} from '../../../infrastructure/sequelize/models/car-post.sql-model'
import {
  MerchantDto,
  MerchantSqlModel
} from '../../../infrastructure/sequelize/models/merchant.sql-model'
import { SequelizeInjectionToken } from '../../../infrastructure/sequelize/providers'
import { AsSql } from '../../../infrastructure/sequelize/types'
import { DateService } from '../../../utils/date.service'
import {
  capitalize,
  cleanString,
  cleanStringOrNull,
  fromNameToId,
  fromStringToNumber,
  stringContains
} from '../../helpers'
import { Job } from '../../types/job'
import { JobHandler } from '../../types/job-handler'
import { extractCylinderFromDisplacement } from '../update-car-engines-br-perf.job.handler'
import {
  cleanTitle,
  generateId,
  mapBody,
  mapColor,
  mapFuel,
  mapGearbox,
  mapInteriorType,
  mapKm,
  mapMake,
  mapPhoneNumber,
  mapPrice,
  mapTransmission,
  mapYear
} from './helpers'

const source = 'AUTOMOBILETN'
const MAX_PAGES = 5
const MAX_KNOWN_POSTS = 3
let errors = 0

const skippedRegions: string[] = []

@Injectable()
@ProcessJobType(JobPlanner.JobType.SCRAP_AUTOMOBILETN)
export class ScrapAutomobiletnJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    private automobiletnApiClient: AutomobiletnApiClient,
    @Inject(SequelizeInjectionToken) private readonly sequelize: Sequelize
  ) {
    super(JobPlanner.JobType.SCRAP_AUTOMOBILETN)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    let page = 1
    let nbKnownPosts = 0
    let nbNewPosts = 0
    let nbSkippedPosts = 0
    try {
      while (page <= MAX_PAGES && nbKnownPosts < MAX_KNOWN_POSTS) {
        this.logger.debug('AUTOMOBILETN SCRAPING PAGE ' + page)
        try {
          const postList = await this.automobiletnApiClient.getList(page)

          for (const postMeta of postList) {
            if (nbKnownPosts >= MAX_KNOWN_POSTS) {
              break
            }

            const generatedPostId = generateId(postMeta.originalId, source)
            const foundPost = await CarPostSqlModel.findByPk(generatedPostId)

            if (foundPost) {
              this.logger.debug('AUTOMOBILETN KNOWN POST')
              nbKnownPosts++
              continue
            }

            const postDetails = await this.automobiletnApiClient.getPostDetail(
              postMeta.originalId
            )

            if (!postDetails || !postDetails.region || !postDetails.year) {
              nbSkippedPosts++
              continue
            }

            const regionId = fromNameToId(postDetails.region)
            if (!Region.Ids.includes(regionId)) {
              skippedRegions.push(postDetails.region)
              continue
            }

            const phoneNumber = mapPhoneNumber(postDetails.phone)

            let merchant: Partial<AsSql<MerchantDto>>
            if (!postDetails.merchant) {
              merchant = {
                id: '62094646-5d1a-4ea1-8f6b-a786d6d2caf2',
                name: 'Anonyme',
                isShop: false,
                categories: [Merchant.Category.CAR_POSTS],
                phoneNumbers: []
              }
            } else {
              merchant = {
                id: postDetails.merchant.idSource,
                name: capitalize(cleanString(postDetails.merchant.name)),
                avatar: cleanStringOrNull(postDetails.merchant.logo),
                isShop: true,
                categories: [Merchant.Category.CAR_POSTS],
                phoneNumbers: phoneNumber ? [phoneNumber] : [],
                regionId,
                regionDetail: null,
                address: cleanStringOrNull(postDetails.merchant.address),
                website: cleanStringOrNull(postDetails.merchant.website),
                idAutomobiletn: postDetails.merchant.urlSource || null,
                gmapsLink: postDetails.merchant.gmaps
              }
            }

            const year = mapYear(postDetails.year)!
            const km = mapKm(
              postDetails.km,
              year,
              this.dateService.currentYear()
            )
            const price = mapPrice(postDetails.price)

            const postToUpsert: AsSql<CarPostDto> = {
              id: generatedPostId,
              source: Source.AUTOMOBILETN,
              idSource: postMeta.originalId,
              urlSource: postDetails.urlSource,
              merchantId: merchant.id!,
              publishedAt: postDetails.date
                ? DateTime.fromFormat(postDetails.date, 'dd.MM.yyyy')
                    .toUTC()
                    .toJSDate()
                : now.toUTC().toJSDate(),
              updatedAt: now.toJSDate(),
              regionId,
              regionDetail: null,
              phoneNumbers: phoneNumber ? [phoneNumber] : [],
              title: cleanTitle(
                `${postDetails.make} ${postDetails.model} ${postDetails.variant}`
              ),
              description: postDetails.description || null,
              images: postDetails.images,
              price,
              make: mapMake(postDetails.make),
              model: cleanStringOrNull(postDetails.model),
              body: mapBody(postDetails.description || '', postDetails.body),
              variant: cleanStringOrNull(postDetails.variant),
              type: cleanStringOrNull(postDetails.type),
              year,
              km,
              fuel: mapFuel(postDetails.fuel),
              cv: postDetails.cv ? fromStringToNumber(postDetails.cv) : null,
              hp:
                Number(postDetails.variant?.match(/(\d{2,3})\s*cv/)?.[1]) ||
                null,
              engine: cleanStringOrNull(postDetails.engine),
              cylinder: extractCylinderFromDisplacement(postDetails.cylinder),
              color: mapColor(postDetails.color),
              gearbox: mapGearbox(
                postDetails?.gearbox,
                postDetails.description || ''
              ),
              interiorType: mapInteriorType(postDetails.interiorType || ''),
              interiorColor: mapColor(postDetails.interiorColor),
              transmission: mapTransmission(postDetails.transmission || ''),
              carPlay: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['android', 'carplay', 'car play']
              ),
              bluetooth: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['bluetooth']
              ),
              sunroof: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['toit', 'panoramique', 'ouvrant']
              ),
              alarm: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['alarm', 'antivol', 'anti vol', 'anti-vol']
              ),
              acAuto: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['clim']
              ),
              ledLights: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['led']
              ),
              ledInterior: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['ambian', 'lumier']
              ),
              keyless: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                [
                  'key',
                  'sans cle',
                  'acces cle',
                  'access cle',
                  'cle access',
                  'cle intelligente'
                ]
              ),
              aluRims: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['jant', 'alu']
              ),
              warranty: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['garantie']
              ),
              camera: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['camera']
              ),
              exchange: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['echang']
              ),
              leasing: optionsContain(
                postDetails.description,
                postDetails.allOptions,
                ['leasing']
              ),
              firstOwner: stringContains(postDetails.description, [
                'premiere main',
                'premier main',
                '1er main',
                '1ere main',
                '1 ere main',
                '1 er main'
              ]),
              carEngineId: null,
              isFeatured: false,
              isExpired: false,
              fcr: stringContains(postDetails.description, ['fcr']),
              newURL: postDetails.new?.urlSource || null,
              newPrice: postDetails.new
                ? fromStringToNumber(postDetails.new.price)
                : null,
              estimatedPrice: null,
              thumbnail: postMeta.thumbnail.trim(),
              options: postDetails.allOptions.map(option => cleanString(option))
            }

            const potentialCarEngineId = await this.findCarEngineId(
              postToUpsert
            )
            postToUpsert.carEngineId = potentialCarEngineId

            // TODO GET TO CHECK IF EXISTING RECENT POST WITH SIMILAIR DETAILS + MERCHANT
            const similarPosts = await CarPostSqlModel.findAll({
              where: {
                [Op.or]: [
                  {
                    title: postToUpsert.title,
                    merchantId: postToUpsert.merchantId
                  },
                  {
                    merchantId: postToUpsert.merchantId,
                    km: postToUpsert.km,
                    price: postToUpsert.price,
                    cv: postToUpsert.cv,
                    year: postToUpsert.year
                  }
                ]
              }
            })
            if (similarPosts.length === 0) {
              await MerchantSqlModel.upsert(merchant)
              await CarPostSqlModel.upsert(postToUpsert)
              nbNewPosts++
              this.logger.debug('ADDED')
            } else {
              this.logger.debug('SIMILAR')
            }
          }
        } catch (e) {
          this.logger.error('Mapping car post error ' + e)
          errors++
        }
        page++
      }
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
      result: {
        skippedRegions: Array.from(new Set(skippedRegions)),
        nbKnownPosts,
        nbSkippedPosts,
        nbPages: page + 1,
        newPosts: nbNewPosts,
        error
      }
    }
  }

  private async findCarEngineId(
    sqlCarPost: Omit<AsSql<CarPostDto>, 'carEngineId'>
  ): Promise<string | null> {
    if (!sqlCarPost.make || !sqlCarPost.model) {
      return null
    }
    const foundEngines = await this.sequelize.query<{
      id: string
      from_year: number
      to_year: number | null
      hp: number | null
      cyliner: string | null
    }>(
      `SELECT * FROM car_engine WHERE
        SIMILARITY(make_id, :makeId) > 0.8 AND
        SIMILARITY(fuel::text, :fuel) > 0.4 AND
        (SIMILARITY(model, :model) > 0.3 OR POSITION(:model IN model) > 0 OR POSITION(model IN :model) > 0)
      `,
      {
        replacements: {
          makeId: sqlCarPost.make?.replace('-Benz', '').replace('-benz', ''),
          fuel: sqlCarPost.fuel || '',
          model: sqlCarPost.model
        },
        type: QueryTypes.SELECT
      }
    )

    const engineIdScore: Array<{ engineId: string; score: number }> = []
    for (const foundEngine of foundEngines) {
      const engineId = foundEngine.id
      let score = 0

      if (sqlCarPost.year) {
        const diffFromYear = sqlCarPost.year - foundEngine.from_year
        if (foundEngine.to_year) {
          if (Math.abs(sqlCarPost.year - foundEngine.to_year) <= 2) {
            if (diffFromYear > 0) {
              if (diffFromYear <= 2) score += 2
              else if (diffFromYear <= 4) score += 1
            }
          }
        } else {
          if (diffFromYear > 0) {
            if (diffFromYear <= 2) score += 2
            else if (diffFromYear <= 4) score += 1
          }
        }
      }
      if (sqlCarPost.cv && foundEngine.hp) {
        const medianHp = sqlCarPost.cv * 16
        if (Math.abs(medianHp - foundEngine.hp) <= 25) {
          score += 1
        }
      }
      if (
        sqlCarPost.cylinder &&
        !isNaN(Number(sqlCarPost.cylinder)) &&
        !isNaN(Number(foundEngine.cyliner))
      ) {
        const diffCylinder = Math.abs(
          Number(sqlCarPost.cylinder) - Number(foundEngine.cyliner)
        )

        if (diffCylinder === 0) score += 3
        else if (diffCylinder <= 0.13) score += 2
        else if (diffCylinder <= 0.2) score += 1
      }

      engineIdScore.push({ engineId, score })
    }
    return engineIdScore.length
      ? engineIdScore.reduce(
          (max, engine) => (engine.score > max.score ? engine : max),
          engineIdScore[0]
        ).engineId
      : null
  }
}

function optionsContain(
  description: string = '',
  options: string[],
  contained: string[]
): boolean {
  for (const option of options) {
    if (stringContains(option, contained)) return true
  }
  if (stringContains(description, contained)) return true
  return false
}
