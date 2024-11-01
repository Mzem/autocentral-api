import { Inject, Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { Op, QueryTypes, Sequelize } from 'sequelize'
import { Source } from '../../../domain/car-post'
import { JobPlanner, ProcessJobType } from '../../../domain/job-planner'
import { Merchant } from '../../../domain/merchant'
import { Region } from '../../../domain/region'
import { TayaraApiClient } from '../../../infrastructure/clients/tayara-api-client'
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
import { extractCylinder } from '../update-car-engines-br-perf.job.handler'
import {
  cleanTitle,
  generateId,
  isPostIgnored,
  mapBody,
  mapColor,
  mapFuel,
  mapGearbox,
  mapInteriorType,
  mapKm,
  mapPhoneNumber,
  mapPrice,
  mapTransmission,
  mapYear
} from './helpers'

const source = 'TAYARA'
const MAX_PAGES = 5
const MAX_KNOWN_POSTS = 3
let errors = 0

const skippedRegions: string[] = []

@Injectable()
@ProcessJobType(JobPlanner.JobType.SCRAP_TAYARA)
export class ScrapTayaraJobHandler extends JobHandler<Job> {
  constructor(
    private dateService: DateService,
    private tayaraApiClient: TayaraApiClient,
    @Inject(SequelizeInjectionToken) private readonly sequelize: Sequelize
  ) {
    super(JobPlanner.JobType.SCRAP_TAYARA)
  }

  async handle(): Promise<JobPlanner.Stats> {
    const now = this.dateService.now()
    let error
    let page = 0
    let nbKnownPosts = 0
    let nbNewPosts = 0
    let nbSkippedPosts = 0
    try {
      while (page <= MAX_PAGES && nbKnownPosts < MAX_KNOWN_POSTS) {
        this.logger.debug('TAYARA SCRAPING PAGE ' + page)
        try {
          const posts = await this.tayaraApiClient.getPosts(page)

          for (const postInfo of posts) {
            const titleDescription =
              (postInfo.post.title || '') +
              ' ' +
              (postInfo.post.description || '')

            if (
              isPostIgnored(
                titleDescription,
                postInfo.post.title,
                postInfo.detail?.make
              )
            ) {
              nbSkippedPosts++
              continue
            }

            const postId = generateId(postInfo.post.id, source)
            const foundPost = await CarPostSqlModel.findByPk(postId)

            if (foundPost) {
              this.logger.debug('TAYARA KNOWN POST')
              nbKnownPosts++
              continue
            }
            const regionId = fromNameToId(postInfo.post.location.governorate)
            if (!Region.Ids.includes(regionId)) {
              skippedRegions.push(postInfo.post.location.governorate)
              continue
            }

            const phoneNumber = mapPhoneNumber(
              postInfo.detail?.merchant.phoneNumber
            )

            const merchant: Partial<AsSql<MerchantDto>> = {
              id: fromNameToId(
                cleanString(postInfo.post.metadata.publisher.name)
              ),
              name: capitalize(
                cleanString(postInfo.post.metadata.publisher.name)
              ),
              avatar: cleanStringOrNull(
                postInfo.post.metadata.publisher.avatar
              ),
              isShop: postInfo.post.metadata.publisher.isShop,
              categories: [Merchant.Category.CAR_POSTS],
              phoneNumbers: phoneNumber ? [phoneNumber] : [],
              regionId,
              regionDetail: cleanStringOrNull(
                postInfo.post.location.delegation
              ),
              description: cleanStringOrNull(
                postInfo.detail?.merchant.description
              ),
              address: cleanStringOrNull(postInfo.detail?.merchant.address),
              website: cleanStringOrNull(postInfo.detail?.merchant.website),
              idTayara: postInfo.detail?.merchant.id || null
            }

            const year = mapYear(postInfo.detail?.year)

            if (
              !year ||
              !phoneNumber ||
              !postInfo.post.images ||
              postInfo.post.images.length === 0
            ) {
              nbSkippedPosts++
              continue
            }

            const km = mapKm(
              postInfo.detail?.km,
              year,
              this.dateService.currentYear()
            )
            const price = mapPrice(postInfo.post.price)

            this.logger.debug(postInfo.detail?.km)
            this.logger.debug(km)
            this.logger.debug(postInfo.post.price)
            this.logger.debug(price)

            const postToUpsert: AsSql<CarPostDto> = {
              id: postId,
              source: Source.TAYARA,
              idSource: postInfo.post.id,
              urlSource: `https://www.tayara.tn/item/${postInfo.post.id}`,
              merchantId: merchant.id!,
              publishedAt: DateTime.fromISO(postInfo.post.metadata.publishedOn)
                .toUTC()
                .toJSDate(),
              updatedAt: now.toJSDate(),
              regionId,
              regionDetail: cleanStringOrNull(
                postInfo.post.location.delegation
              ),
              phoneNumbers: phoneNumber ? [phoneNumber] : [],
              title: cleanTitle(postInfo.post.title),
              description: postInfo.post.description,
              images: postInfo.post.images,
              price,
              make: cleanStringOrNull(postInfo.detail?.make),
              model: cleanStringOrNull(postInfo.detail?.model),
              body: mapBody(titleDescription, postInfo.detail?.body),
              variant: null,
              type: null,
              year,
              km,
              fuel: mapFuel(postInfo.detail?.fuel),
              cv: postInfo.detail?.cv
                ? fromStringToNumber(postInfo.detail?.cv)
                : null,
              hp: null,
              engine: cleanStringOrNull(postInfo.detail?.cylinder),
              cylinder: postInfo.detail?.cylinder
                ? extractCylinder(postInfo.detail?.cylinder)
                : null,
              color: mapColor(postInfo.detail?.color),
              gearbox: mapGearbox(postInfo.detail?.gearbox, titleDescription),
              interiorType: mapInteriorType(titleDescription),
              interiorColor: null,
              transmission: mapTransmission(titleDescription),
              carPlay: stringContains(titleDescription, [
                'android',
                'carplay',
                'car play'
              ]),
              bluetooth: stringContains(titleDescription, ['bluetooth']),
              sunroof: stringContains(titleDescription, [
                'toit',
                'panoramique',
                'ouvrant'
              ]),
              alarm: stringContains(titleDescription, [
                'alarm',
                'antivol',
                'anti vol',
                'anti-vol'
              ]),
              acAuto: stringContains(titleDescription, ['clim']),
              ledLights: stringContains(titleDescription, ['led']),
              ledInterior: stringContains(titleDescription, [
                'ambian',
                'lumier'
              ]),
              keyless: stringContains(titleDescription, [
                'key',
                'sans cle',
                'acces cle',
                'access cle',
                'cle access',
                'cle intelligente'
              ]),
              aluRims: stringContains(titleDescription, ['jant', 'alu']),
              warranty: stringContains(titleDescription, ['garantie']),
              camera: stringContains(titleDescription, ['camera']),
              exchange: stringContains(titleDescription, ['echang']),
              leasing: stringContains(titleDescription, ['leasing']),
              firstOwner: stringContains(titleDescription, [
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
              fcr: stringContains(titleDescription, ['fcr']),
              newURL: null,
              newPrice: null,
              estimatedPrice: null,
              thumbnail: null,
              options: null
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
