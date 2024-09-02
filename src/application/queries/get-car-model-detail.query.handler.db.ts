import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { CarEngineSqlModel } from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { mapEngineYears, mapMakeSQLToQueryModel } from './mappers'
import { CarMakeQueryModel } from './get-car-makes.query.handler.db'
import { CarModelSqlModel } from '../../infrastructure/sequelize/models/car-model.sql-model'

class RelatedModel {
  @ApiProperty()
  id: string

  @ApiProperty({ required: false })
  productionYears?: string

  @ApiProperty({ required: false })
  engineDetail?: string

  @ApiProperty({ required: false })
  body?: string

  @ApiProperty({ required: false })
  acceleration?: number

  @ApiProperty({ required: false })
  topSpeed?: number

  @ApiProperty({ required: false })
  fuelSystem?: string

  @ApiProperty({ required: false })
  fuelHighway?: string

  @ApiProperty({ required: false })
  fuelUrban?: string

  @ApiProperty({ required: false })
  fuelCombined?: string
}

export class CarModelDetailQueryModel {
  @ApiProperty()
  id: string
  @ApiProperty()
  make: CarMakeQueryModel
  @ApiProperty()
  model: string
  @ApiProperty()
  years: string

  @ApiProperty()
  relatedModels: RelatedModel[]

  @ApiProperty({ required: false })
  type?: string
  @ApiProperty({ required: false })
  engineName?: string
  @ApiProperty({ required: false })
  cylinder?: string
  @ApiProperty({ required: false })
  fuel?: string
  @ApiProperty({ required: false })
  hp?: number
  @ApiProperty({ required: false })
  hpRemap?: number
  @ApiProperty({ required: false })
  torque?: number
  @ApiProperty({ required: false })
  torqueRemap?: number
  @ApiProperty({ required: false })
  urlSource?: string
}

export interface GetCarModelDetailQuery extends Query {
  modelId: string
}

@Injectable()
export class GetCarModelDetailQueryHandler extends QueryHandler<
  GetCarModelDetailQuery,
  CarModelDetailQueryModel
> {
  constructor() {
    super('GetCarModelDetailQueryHandler')
  }

  async handle(
    query: GetCarModelDetailQuery
  ): Promise<Result<CarModelDetailQueryModel>> {
    const engineSQL = await CarEngineSqlModel.findByPk(query.modelId, {
      include: [
        { model: CarMakeSqlModel, required: true },
        {
          model: CarModelSqlModel,
          required: false
        }
      ]
    })

    if (!engineSQL) {
      return NotFoundFailure('Car Engine Model', query.modelId)
    }

    return success({
      id: engineSQL.id,
      make: mapMakeSQLToQueryModel(engineSQL.make!),
      model: engineSQL.model,
      years: mapEngineYears(engineSQL.fromYear, engineSQL.toYear),
      type: engineSQL.type ?? undefined,
      engineName: engineSQL.engineName ?? undefined,
      cylinder: engineSQL.cylinder ?? undefined,
      fuel: engineSQL.fuel ?? undefined,
      hp: engineSQL.hp ?? undefined,
      hpRemap: engineSQL.hpRemap ?? undefined,
      torque: engineSQL.torque ?? undefined,
      torqueRemap: engineSQL.torqueRemap ?? undefined,
      urlSource: engineSQL.urlSource ?? undefined,
      relatedModels: engineSQL.models.map(model => ({
        id: model.id,
        productionYears: model.productionYears ?? undefined,
        engineDetail: model.engineDetail ?? undefined,
        body: model.body ?? undefined,
        acceleration: model.acceleration ?? undefined,
        topSpeed: model.topSpeed ?? undefined,
        fuelSystem: model.fuelSystem ?? undefined,
        fuelHighway: model.fuelHighway ?? undefined,
        fuelUrban: model.fuelUrban ?? undefined,
        fuelCombined: model.fuelCombined ?? undefined
      }))
    })
  }
}
