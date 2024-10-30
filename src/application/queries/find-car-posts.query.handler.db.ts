import { Inject, Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Op, OrderItem, Sequelize, WhereOptions } from 'sequelize'
import { Fuel, Gearbox, Transmission } from '../../domain/car-model'
import { Color, InteriorType } from '../../domain/car-post'
import { CarPostSqlModel } from '../../infrastructure/sequelize/models/car-post.sql-model'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { RegionSqlModel } from '../../infrastructure/sequelize/models/region.sql-model'
import { MerchantListItemQueryModel, RegionQueryModel } from './query-models'
import { DateTime } from 'luxon'
import { DateService } from '../../utils/date.service'
import { MerchantSqlModel } from '../../infrastructure/sequelize/models/merchant.sql-model'
import { SequelizeInjectionToken } from '../../infrastructure/sequelize/providers'

const MAX_PAGE_SIZE = 20

export enum FindCarPostsTri {
  PRIX_ASC = 'PRIX_ASC',
  PRIX_DESC = 'PRIX_DESC'
}
const mapTri: Record<FindCarPostsTri, OrderItem> = {
  PRIX_ASC: ['price', 'ASC'],
  PRIX_DESC: ['price', 'DESC']
}

export class CarPostListItemQueryModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  source: string

  @ApiProperty()
  publishedAt: string

  @ApiProperty()
  publishedAtText: string

  @ApiProperty()
  region: RegionQueryModel

  @ApiProperty()
  merchant: MerchantListItemQueryModel

  @ApiProperty()
  phone: string

  @ApiProperty({ required: false })
  title: string | undefined

  @ApiProperty()
  image: string

  @ApiProperty({ required: false })
  price: number | undefined

  @ApiProperty({ required: false })
  make: string | undefined

  @ApiProperty({ required: false })
  model: string | undefined

  @ApiProperty({ required: false })
  year: number | undefined

  @ApiProperty({ required: false })
  km: number | undefined

  @ApiProperty({ required: false })
  fuel: string | undefined

  @ApiProperty({ required: false })
  cv: number | undefined

  @ApiProperty({ required: false })
  engine: string | undefined

  @ApiProperty({ required: false })
  gearbox: string | undefined

  @ApiProperty({ required: false })
  exchange: boolean | undefined

  @ApiProperty({ required: false })
  leasing: boolean | undefined

  @ApiProperty({ required: false })
  firstOwner: boolean | undefined
}

export interface FindCarPostsQuery extends Query {
  page: number
  merchantId?: string
  make?: string
  model?: string
  regionIds?: string[]
  fuel?: Fuel[]
  color?: Color[]
  interiorType?: InteriorType[]
  transmission?: Transmission
  minPrice?: number
  maxPrice?: number
  minKm?: number
  maxKm?: number
  minYear?: number
  maxYear?: number
  minCV?: number
  maxCV?: number
  minHP?: number
  maxHP?: number
  isAuto?: boolean
  carPlay?: boolean
  bluetooth?: boolean
  sunroof?: boolean
  alarm?: boolean
  acAuto?: boolean
  ledLights?: boolean
  ledInterior?: boolean
  keyless?: boolean
  aluRims?: boolean
  exchange?: boolean
  leasing?: boolean
  camera?: boolean
  firstOwner?: boolean
  isShop?: boolean
  q?: string
  tri?: FindCarPostsTri
}

@Injectable()
export class FindCarPostsQueryHandler extends QueryHandler<
  FindCarPostsQuery,
  CarPostListItemQueryModel[]
> {
  constructor(
    private readonly dateService: DateService,
    @Inject(SequelizeInjectionToken) private readonly sequelize: Sequelize
  ) {
    super('FindCarPostsQueryHandler')
  }

  async handle(
    query: FindCarPostsQuery
  ): Promise<Result<CarPostListItemQueryModel[]>> {
    const filters: WhereOptions[] = []

    if (query.merchantId) filters.push({ merchantId: query.merchantId })
    if (query.make) filters.push({ make: query.make })
    if (query.model) filters.push({ model: query.model })
    if (query.regionIds)
      filters.push({ [Op.or]: query.regionIds.map(regionId => ({ regionId })) })
    if (query.fuel)
      filters.push({ [Op.or]: query.fuel.map(fuel => ({ fuel })) })
    if (query.color)
      filters.push({ [Op.or]: query.color.map(color => ({ color })) })
    if (query.isAuto) filters.push({ gearbox: Gearbox.AUTO })
    if (query.interiorType)
      filters.push({
        [Op.or]: query.interiorType.map(interiorType => ({ interiorType }))
      })
    if (query.transmission) filters.push({ transmission: query.transmission })
    if (query.sunroof) filters.push({ sunroof: query.sunroof })
    if (query.carPlay) filters.push({ carPlay: true })
    if (query.bluetooth) filters.push({ bluetooth: true })
    if (query.alarm) filters.push({ alarm: true })
    if (query.keyless) filters.push({ keyless: true })
    if (query.acAuto) filters.push({ acAuto: true })
    if (query.ledLights) filters.push({ ledLights: true })
    if (query.ledInterior) filters.push({ ledInterior: true })
    if (query.aluRims) filters.push({ aluRims: true })
    if (query.exchange) filters.push({ exchange: true })
    if (query.leasing) filters.push({ leasing: true })
    if (query.camera) filters.push({ camera: true })
    if (query.firstOwner) filters.push({ firstOwner: true })
    if (query.minPrice)
      filters.push({
        price: {
          [Op.gte]: query.minPrice
        }
      })
    if (query.maxPrice)
      filters.push({
        price: {
          [Op.lte]: query.maxPrice
        }
      })
    if (query.minYear)
      filters.push({
        year: {
          [Op.gte]: query.minYear
        }
      })
    if (query.maxYear)
      filters.push({
        year: {
          [Op.lte]: query.maxYear
        }
      })
    if (query.minKm)
      filters.push({
        km: {
          [Op.gte]: query.minKm
        }
      })
    if (query.maxKm)
      filters.push({
        km: {
          [Op.lte]: query.maxKm
        }
      })
    if (query.minCV)
      filters.push({
        cv: {
          [Op.gte]: query.minCV
        }
      })
    if (query.maxCV)
      filters.push({
        cv: {
          [Op.lte]: query.maxCV
        }
      })
    if (query.minHP)
      filters.push({
        hp: {
          [Op.gte]: query.minHP
        }
      })
    if (query.maxHP)
      filters.push({
        hp: {
          [Op.lte]: query.maxHP
        }
      })

    if (query.q) {
      filters.push(
        this.sequelize.literal(
          `(SIMILARITY(title, :searchQuery) > 0.6 OR description ILIKE '%' || :searchQuery || '%' OR SIMILARITY(CONCAT(make, ' ', model), :searchQuery) > 0.6 OR SIMILARITY(model, :searchQuery) > 0.7)`
        )
      )
    }

    const whereShop = query.isShop ? { where: { isShop: true } } : {}

    const postsSQL = await CarPostSqlModel.findAll({
      order: [query.tri ? mapTri[query.tri] : ['published_at', 'DESC']],
      limit: MAX_PAGE_SIZE,
      offset: (query.page - 1) * MAX_PAGE_SIZE,
      where: {
        [Op.and]: filters
      },
      include: [
        { model: RegionSqlModel, required: true },
        {
          model: MerchantSqlModel,
          required: true,
          duplicating: true,
          attributes: ['id', 'name', 'avatar', 'isShop'],
          ...whereShop
        }
      ],
      replacements: { searchQuery: query.q }
    })

    return success(
      postsSQL
        .filter(postSQL => postSQL.phoneNumbers.length > 0)
        .map(postSQL => ({
          id: postSQL.id,
          source: postSQL.source,
          publishedAt: postSQL.publishedAt.toLocaleDateString('fr'),
          publishedAtText: this.dateService.toRelative(
            DateTime.fromJSDate(postSQL.publishedAt)
          ),
          region: { id: postSQL.region!.id, name: postSQL.region!.name },
          merchant: {
            id: postSQL.merchant!.id,
            name: postSQL.merchant!.name.toLowerCase().includes('anonym')
              ? ''
              : postSQL.merchant!.name,
            avatar: postSQL.merchant!.avatar ?? undefined,
            isShop: postSQL.merchant!.isShop
          },
          phone: '+216' + postSQL.phoneNumbers[0],
          title: postSQL.title ?? undefined,
          image: postSQL.images[0],
          price: postSQL.price ?? undefined,
          make: postSQL.make ?? undefined,
          model: postSQL.model ?? undefined,
          year: postSQL.year ?? undefined,
          km: postSQL.km ?? undefined,
          fuel: postSQL.fuel ?? undefined,
          cv: postSQL.cv ?? undefined,
          engine: postSQL.engine ?? undefined,
          gearbox: postSQL.gearbox ?? undefined,
          exchange: postSQL.exchange ?? undefined,
          leasing: postSQL.leasing ?? undefined,
          firstOwner: postSQL.firstOwner ?? undefined
        }))
        .filter(post => post.image !== undefined)
    )
  }
}
