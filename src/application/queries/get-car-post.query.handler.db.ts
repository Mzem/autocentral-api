import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { DateTime } from 'luxon'
import { CarEngineSqlModel } from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { CarModelSqlModel } from '../../infrastructure/sequelize/models/car-model.sql-model'
import { CarPostSqlModel } from '../../infrastructure/sequelize/models/car-post.sql-model'
import { MerchantSqlModel } from '../../infrastructure/sequelize/models/merchant.sql-model'
import { RegionSqlModel } from '../../infrastructure/sequelize/models/region.sql-model'
import { DateService } from '../../utils/date.service'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import {
  CarModelDetailQueryModel,
  fromEngineSqlToQueryModel
} from './get-car-model.query.handler.db'
import { MerchantListItemQueryModel, RegionQueryModel } from './query-models'

export class CarPostQueryModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  source: string

  @ApiProperty({ required: false })
  urlSource: string | undefined

  @ApiProperty()
  publishedAt: string

  @ApiProperty()
  publishedAtText: string

  @ApiProperty()
  region: RegionQueryModel

  @ApiProperty()
  merchant: MerchantListItemQueryModel

  @ApiProperty({ required: false })
  carEngine: CarModelDetailQueryModel | undefined

  @ApiProperty({ required: false })
  phone: string | undefined

  @ApiProperty({ required: false })
  title: string | undefined

  @ApiProperty({ required: false })
  description: string | undefined

  @ApiProperty()
  images: string[]

  @ApiProperty({ required: false })
  price: number | undefined

  @ApiProperty({ required: false })
  make: string | undefined

  @ApiProperty({ required: false })
  model: string | undefined

  @ApiProperty({ required: false })
  body: string | undefined

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
  interiorType: string | undefined

  @ApiProperty({ required: false })
  interiorColor: string | undefined

  @ApiProperty({ required: false })
  transmission: string | undefined

  @ApiProperty({ required: false })
  carPlay: boolean | undefined

  @ApiProperty({ required: false })
  bluetooth: boolean | undefined

  @ApiProperty({ required: false })
  camera: boolean | undefined

  @ApiProperty({ required: false })
  sunroof: boolean | undefined

  @ApiProperty({ required: false })
  alarm: boolean | undefined

  @ApiProperty({ required: false })
  acAuto: boolean | undefined

  @ApiProperty({ required: false })
  ledLights: boolean | undefined

  @ApiProperty({ required: false })
  ledInterior: boolean | undefined

  @ApiProperty({ required: false })
  keyless: boolean | undefined

  @ApiProperty({ required: false })
  aluRims: boolean | undefined

  @ApiProperty({ required: false })
  warranty: boolean | undefined

  @ApiProperty({ required: false })
  exchange: boolean | undefined

  @ApiProperty({ required: false })
  leasing: boolean | undefined

  @ApiProperty({ required: false })
  firstOwner: boolean | undefined
}

export interface GetCarPostQuery extends Query {
  carPostId: string
}

@Injectable()
export class GetCarPostQueryHandler extends QueryHandler<
  GetCarPostQuery,
  CarPostQueryModel
> {
  constructor(private readonly dateService: DateService) {
    super('GetCarPostQueryHandler')
  }

  async handle(query: GetCarPostQuery): Promise<Result<CarPostQueryModel>> {
    const postSQL = await CarPostSqlModel.findByPk(query.carPostId, {
      include: [
        { model: RegionSqlModel, required: true },
        { model: MerchantSqlModel, required: true },
        {
          model: CarEngineSqlModel,
          required: false,
          include: [
            { model: CarMakeSqlModel, required: true },
            {
              model: CarModelSqlModel,
              required: false
            }
          ]
        }
      ]
    })

    if (!postSQL) {
      return NotFoundFailure('Car Post', query.carPostId)
    }

    return success({
      id: postSQL.id,
      source: postSQL.source,
      urlSource: postSQL.urlSource ?? undefined,
      publishedAt: postSQL.publishedAt.toLocaleDateString('fr'),
      publishedAtText: this.dateService.toRelative(
        DateTime.fromJSDate(postSQL.publishedAt)
      ),
      region: { id: postSQL.region!.id, name: postSQL.region!.name },
      merchant: {
        id: postSQL.merchant!.id,
        name: postSQL.merchant!.name,
        avatar: postSQL.merchant!.avatar ?? undefined,
        isShop: postSQL.merchant!.isShop
      },
      carEngine: postSQL.carEngine
        ? fromEngineSqlToQueryModel(postSQL.carEngine)
        : undefined,
      phone: '+216' + postSQL.phoneNumbers[0],
      title: postSQL.title ?? undefined,
      description: postSQL.description ?? undefined,
      images: postSQL.images,
      price: postSQL.price ?? undefined,
      make: postSQL.make ?? undefined,
      model: postSQL.model ?? undefined,
      body: postSQL.body ?? undefined,
      year: postSQL.year ?? undefined,
      km: postSQL.km ?? undefined,
      fuel: postSQL.fuel ?? undefined,
      cv: postSQL.cv ?? undefined,
      engine: postSQL.engine ?? undefined,
      gearbox: postSQL.gearbox ?? undefined,
      transmission: postSQL.transmission ?? undefined,
      interiorType: postSQL.interiorType ?? undefined,
      interiorColor: postSQL.interiorColor ?? undefined,
      carPlay: postSQL.carPlay ?? undefined,
      bluetooth: postSQL.bluetooth ?? undefined,
      camera: postSQL.camera ?? undefined,
      sunroof: postSQL.sunroof ?? undefined,
      alarm: postSQL.alarm ?? undefined,
      acAuto: postSQL.acAuto ?? undefined,
      ledLights: postSQL.ledLights ?? undefined,
      ledInterior: postSQL.ledInterior ?? undefined,
      keyless: postSQL.keyless ?? undefined,
      aluRims: postSQL.aluRims ?? undefined,
      warranty: postSQL.warranty ?? undefined,
      exchange: postSQL.exchange ?? undefined,
      leasing: postSQL.leasing ?? undefined,
      firstOwner: postSQL.firstOwner ?? undefined
    })
  }
}
