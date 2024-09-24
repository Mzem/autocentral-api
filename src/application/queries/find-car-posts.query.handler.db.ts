import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Op, WhereOptions } from 'sequelize'
import { Fuel, Gearbox, Transmission } from '../../domain/car-model'
import { Color, InteriorType } from '../../domain/car-post'
import { CarPostSqlModel } from '../../infrastructure/sequelize/models/car-post.sql-model'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { RegionSqlModel } from '../../infrastructure/sequelize/models/region.sql-model'

const MAX_PAGE_SIZE = 20

export class CarPostListItemQueryModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  source: string

  @ApiProperty({ required: false })
  publishedAt: string

  @ApiProperty({ required: false })
  region: string | undefined

  @ApiProperty({ required: false })
  phone: number | undefined

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
  gearbox: Gearbox | undefined

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
  regionId?: string
  fuel?: Fuel
  color?: Color
  gearbox?: Gearbox
  interiorType?: InteriorType
  transmission?: Transmission
  maxPrice?: number
  maxKm?: number
  minYear?: number
  maxYear?: number
  minCV?: number
  maxCV?: number
  minHP?: number
  maxHP?: number
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
}

@Injectable()
export class FindCarPostsQueryHandler extends QueryHandler<
  FindCarPostsQuery,
  CarPostListItemQueryModel[]
> {
  constructor() {
    super('FindCarPostsQueryHandler')
  }

  async handle(
    query: FindCarPostsQuery
  ): Promise<Result<CarPostListItemQueryModel[]>> {
    const filters: WhereOptions[] = []

    if (query.merchantId) filters.push({ merchantId: query.merchantId })
    if (query.make) filters.push({ make: query.make })
    if (query.model) filters.push({ model: query.model })
    if (query.regionId) filters.push({ regionId: query.regionId })
    if (query.fuel) filters.push({ fuel: query.fuel })
    if (query.color) filters.push({ color: query.color })
    if (query.gearbox) filters.push({ gearbox: query.gearbox })
    if (query.interiorType) filters.push({ interiorType: query.interiorType })
    if (query.transmission) filters.push({ transmission: query.transmission })
    if (query.transmission) filters.push({ transmission: query.transmission })
    if (query.carPlay) filters.push({ carPlay: true })
    if (query.bluetooth) filters.push({ bluetooth: true })
    if (query.alarm) filters.push({ alarm: true })
    if (query.acAuto) filters.push({ acAuto: true })
    if (query.ledLights) filters.push({ ledLights: true })
    if (query.ledInterior) filters.push({ ledInterior: true })
    if (query.aluRims) filters.push({ aluRims: true })
    if (query.exchange) filters.push({ exchange: true })
    if (query.leasing) filters.push({ leasing: true })
    if (query.camera) filters.push({ camera: true })
    if (query.firstOwner) filters.push({ firstOwner: true })
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

    const postsSQL = await CarPostSqlModel.findAll({
      order: [['published_at', 'DESC']],
      limit: MAX_PAGE_SIZE,
      offset: (query.page - 1) * MAX_PAGE_SIZE,
      where: {
        [Op.and]: filters
      },
      include: [{ model: RegionSqlModel, required: false }]
    })

    return success(
      postsSQL
        .map(postSQL => ({
          id: postSQL.id,
          source: postSQL.source,
          publishedAt: postSQL.publishedAt.toLocaleTimeString('fr'),
          region: postSQL.region?.name,
          phone: postSQL.phoneNumbers[0],
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
