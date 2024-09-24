import { Inject, Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { QueryTypes, Sequelize } from 'sequelize'
import { Fuel, Gearbox, Transmission } from '../../../domain/car-model'
import { BodyType, Color, InteriorType, Source } from '../../../domain/car-post'
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
  fromStringToNumber
} from '../../helpers'
import { Job } from '../../types/job'
import { JobHandler } from '../../types/job-handler'
import { extractCylinder } from '../update-car-engines-br-perf.job.handler'

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
    let newPosts = 0
    try {
      while (page <= MAX_PAGES && nbKnownPosts < MAX_KNOWN_POSTS) {
        this.logger.debug('TAYARA SCRAPING PAGE ' + page)
        try {
          const posts = await this.tayaraApiClient.getPosts(page)

          for (const postInfo of posts) {
            const postId = generateId(postInfo.post.id)
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

            const postToUpsert: AsSql<CarPostDto> = {
              id: postId,
              source: Source.TAYARA,
              idSource: postInfo.post.id,
              urlSource: `https://www.tayara.tn/item/${postInfo.post.id}`,
              merchantId: merchant.id!,
              publishedAt: DateTime.fromISO(postInfo.post.metadata.publishedOn)
                .toUTC()
                .toJSDate(),
              updatedAt: this.dateService.nowJs(),
              regionId,
              regionDetail: cleanStringOrNull(
                postInfo.post.location.delegation
              ),
              phoneNumbers: phoneNumber ? [phoneNumber] : [],
              title: cleanStringOrNull(postInfo.post.title.substring(0, 50)),
              description: postInfo.post.description,
              images: postInfo.post.images,
              price: mapPrice(postInfo.post.price),
              make: cleanStringOrNull(postInfo.detail?.make),
              model: cleanStringOrNull(postInfo.detail?.model),
              body: mapBody(
                postInfo.post.title,
                postInfo.post.description,
                postInfo.detail?.body
              ),
              year: mapYear(postInfo.detail?.year),
              km: postInfo.detail?.km
                ? fromStringToNumber(postInfo.detail.km)
                : null,
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
              gearbox: mapGearbox(postInfo.detail?.gearbox),
              interiorType: mapInteriorType(postInfo.post.description),
              interiorColor: null,
              transmission: mapTransmission(postInfo.post.description),
              carPlay: stringContains(postInfo.post.description, [
                'android',
                'carplay',
                'car play'
              ]),
              bluetooth: stringContains(postInfo.post.description, [
                'bluetooth'
              ]),
              sunroof: stringContains(postInfo.post.description, [
                'toit',
                'panoramique',
                'ouvrant'
              ]),
              alarm: stringContains(postInfo.post.description, [
                'alarm',
                'antivol',
                'anti vol',
                'anti-vol'
              ]),
              acAuto: stringContains(postInfo.post.description, ['clim']),
              ledLights: stringContains(postInfo.post.description, ['led']),
              ledInterior: stringContains(postInfo.post.description, [
                'ambian',
                'lumier'
              ]),
              keyless: stringContains(postInfo.post.description, [
                'keyles',
                'cle'
              ]),
              aluRims: stringContains(postInfo.post.description, [
                'jant',
                'alu'
              ]),
              warranty: stringContains(postInfo.post.description, ['garantie']),
              camera: stringContains(postInfo.post.description, ['camera']),
              exchange: stringContains(postInfo.post.description, ['echang']),
              leasing: stringContains(postInfo.post.description, ['leasing']),
              firstOwner: stringContains(postInfo.post.description, [
                'premiere main',
                'premier main',
                '1er main',
                '1ere main',
                '1 ere main',
                '1 er main'
              ]),
              carEngineId: null,
              isFeatured: false
            }

            const potentialCarEngineId = await this.findCarEngineId(
              postToUpsert
            )
            postToUpsert.carEngineId = potentialCarEngineId

            await MerchantSqlModel.upsert(merchant)
            await CarPostSqlModel.upsert(postToUpsert)
            newPosts++
          }
        } catch (e) {
          this.logger.error('GET ERROR ' + e)
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
        nbPages: page + 1,
        newPosts,
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

function stringContains(string: string, containedList: string[]): boolean {
  for (const containedOne of containedList) {
    if (
      string
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .includes(containedOne)
    ) {
      return true
    }
  }
  return false
}

function generateId(postId: string): string {
  return `TAYARA-${postId}`
}

function mapInteriorType(description: string): InteriorType | null {
  if (stringContains(description, ['simili'])) return InteriorType.LEATHERETTE
  if (stringContains(description, ['cuir'])) return InteriorType.LEATHER
  if (stringContains(description, ['alcant'])) return InteriorType.ALCANTARA
  if (stringContains(description, ['tissu'])) return InteriorType.FABRIC

  return null
}

function mapPrice(price: string): number | null {
  const sanitized = fromStringToNumber(price)
  if (
    sanitized === 0 ||
    sanitized.toString().length === 1 ||
    (sanitized.toString().length === 4 &&
      !sanitized.toString().includes('00')) ||
    sanitized.toString().includes('123') ||
    sanitized.toString().includes('111') ||
    sanitized.toString().includes('999')
  )
    return null
  if (sanitized.toString().length === 2 || sanitized.toString().length === 3)
    return Number(sanitized.toString() + '000')

  return sanitized
}

function mapBody(
  title: string,
  description: string,
  body?: string | null
): BodyType | null {
  if (!body) return null

  if (
    stringContains(title, [
      'partnair',
      'partner',
      'kango',
      'berling',
      'doblo',
      'dok',
      'cady',
      'caddy',
      'caddy'
    ])
  )
    return BodyType.UTILITY

  if (stringContains(title + ' ' + description, ['van', 'hicace', 'scenic']))
    return BodyType.MONOSPACE_VAN

  if (stringContains(title + ' ' + description, ['coupe']))
    return BodyType.COUPE

  if (
    stringContains(title + ' ' + description, ['roadster', 'cabrio', 'decapo'])
  )
    return BodyType.CABRIOLET

  if (stringContains(title + ' ' + description, ['break']))
    return BodyType.BREAK

  if (
    stringContains(title + ' ' + description, [
      'polo',
      'ibiza',
      'golf',
      'leon',
      'rio'
    ])
  )
    return BodyType.COMPACT

  const sanitized = cleanString(body)

  switch (sanitized) {
    case 'Compacte':
      return BodyType.COMPACT
    case 'Berline':
      return BodyType.BERLINE
    case 'Cabriolet':
      return BodyType.CABRIOLET
    case '4 x 4':
      return BodyType.SUV
    case 'Monospace':
      return BodyType.MONOSPACE_VAN
    case 'Utilitaire':
      return BodyType.UTILITY
    case 'Pick up':
      return BodyType.PICKUP
  }
  return null
}

function mapTransmission(description: string): Transmission | null {
  if (
    stringContains(description, [
      'integral',
      '4 motion',
      '4motion',
      '4matic',
      '4 matic',
      'x drive',
      'xdrive',
      'awd',
      '4wd',
      '4 wd',
      '4 roue',
      '4roue',
      'quatre roue'
    ])
  )
    return Transmission.AWD
  return null
}

function mapGearbox(gearbox: string | null | undefined): Gearbox | null {
  const cleaned = cleanStringOrNull(gearbox)

  switch (cleaned) {
    case 'Automatique':
      return Gearbox.AUTO
    case 'Manuelle':
      return Gearbox.MANUAL
    default:
      return null
  }
}

function mapColor(color: string | null | undefined): Color | null {
  const cleaned = cleanStringOrNull(color)

  switch (cleaned) {
    case 'Argent':
    case 'Gris':
      return Color.GREY
    case 'Beige':
    case 'Camel':
    case 'Doré':
    case 'Marron':
      return Color.BROWN
    case 'Blanc':
      return Color.WHITE
    case 'Bleu':
    case 'Corail':
      return Color.BLUE
    case 'Jaune':
      return Color.YELLOW
    case 'Noir':
      return Color.BLACK
    case 'Orange':
      return Color.ORANGE
    case 'Rose':
      return Color.PINK
    case 'Rouge':
      return Color.RED
    case 'Vert':
      return Color.GREEN
    case 'Violet':
      return Color.PURPLE
    default:
      return null
  }
}

function mapFuel(fuel: string | null | undefined): Fuel | null {
  const cleaned = cleanStringOrNull(fuel)

  switch (cleaned) {
    case 'Essence':
      return Fuel.ESSENCE
    case 'Diesel':
      return Fuel.DIESEL
    case 'Hybride':
      return Fuel.HYBRID
    case 'Hybride Diesel':
      return Fuel.DIESEL_HYBRID
    case 'Hybride Essence':
      return Fuel.ESSENCE_HYBRID
    case 'Electrique':
      return Fuel.ELECTRIQUE
    default:
      return null
  }
}

function mapYear(year: string | undefined | null): number | null {
  if (!year) return null
  const tmpYear = fromStringToNumber(year)
  const potentialYear = tmpYear.toString().slice(-4)
  if (potentialYear.length !== 4 || isNaN(Number(potentialYear))) return null

  return Number(potentialYear)
}

function mapPhoneNumber(phone: string | undefined | null): number | null {
  if (!phone) return null
  const tmpPhone = fromStringToNumber(phone)
  const potentialPhoneNumber = tmpPhone.toString().slice(-8)
  if (potentialPhoneNumber.length !== 8 || isNaN(Number(potentialPhoneNumber)))
    return null

  return Number(potentialPhoneNumber)
}
