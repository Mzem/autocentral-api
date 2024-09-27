import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { CarEngineSqlModel } from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { CarModelSqlModel } from '../../infrastructure/sequelize/models/car-model.sql-model'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { CarMakeQueryModel } from './query-models'
import { mapMakeSQLToQueryModel } from './mappers'

class RelatedModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  model: string

  @ApiProperty()
  fromYear: number

  @ApiProperty({ required: false })
  engineDetail?: string

  @ApiProperty({ required: false })
  engineType?: string

  @ApiProperty({ required: false })
  cylinder?: string

  @ApiProperty({ required: false })
  body?: string

  @ApiProperty({ required: false })
  hp?: string

  @ApiProperty({ required: false })
  torque?: string

  @ApiProperty({ required: false })
  acceleration?: number

  @ApiProperty({ required: false })
  topSpeed?: number

  @ApiProperty({ required: false })
  fuelSystem?: string

  @ApiProperty({ required: false })
  driveType?: string

  @ApiProperty({ required: false })
  gearbox?: string

  @ApiProperty({ required: false })
  weight?: string

  @ApiProperty({ required: false })
  height?: string

  @ApiProperty({ required: false })
  length?: string

  @ApiProperty({ required: false })
  width?: string

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
  @ApiProperty({ required: false })
  fromYear?: number
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
  hpStage1?: number
  @ApiProperty({ required: false })
  hpStage2?: number
  @ApiProperty({ required: false })
  torque?: number
  @ApiProperty({ required: false })
  torqueStage1?: number
  @ApiProperty({ required: false })
  torqueStage2?: number
  @ApiProperty({ required: false })
  urlSource?: string

  @ApiProperty()
  relatedModels: RelatedModel[]
}

export interface GetCarModelQuery extends Query {
  modelId: string
}

@Injectable()
export class GetCarModelQueryHandler extends QueryHandler<
  GetCarModelQuery,
  CarModelDetailQueryModel
> {
  constructor() {
    super('GetCarModelQueryHandler')
  }

  async handle(
    query: GetCarModelQuery
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

    return success(fromEngineSqlToQueryModel(engineSQL))
  }
}

export function fromEngineSqlToQueryModel(
  engineSQL: CarEngineSqlModel
): CarModelDetailQueryModel {
  return {
    id: engineSQL.id,
    make: mapMakeSQLToQueryModel(engineSQL.make!),
    model: engineSQL.model,
    fromYear: engineSQL.fromYear ?? undefined,
    type: engineSQL.type ?? undefined,
    engineName: engineSQL.engineName ?? undefined,
    cylinder: engineSQL.cylinder ?? undefined,
    fuel: engineSQL.fuel ?? undefined,
    hp: engineSQL.hp ?? undefined,
    hpStage1: engineSQL.hpStage1 ?? undefined,
    hpStage2: engineSQL.hpStage2 ?? undefined,
    torque: engineSQL.torque ?? undefined,
    torqueStage1: engineSQL.torqueStage1 ?? undefined,
    torqueStage2: engineSQL.torqueStage2 ?? undefined,
    urlSource:
      engineSQL.urlSourceShiftech || engineSQL.urlSourceBRPerf || undefined,
    relatedModels: engineSQL.models.map(model => ({
      id: model.id,
      fromYear: model.fromYear,
      model: model.model,
      engineDetail: model.engineDetail ?? undefined,
      cylinder: model.cylinder ?? undefined,
      body: model.body ?? undefined,
      hp: model.hp?.toString() ?? undefined,
      torque: model.torque?.toString() ?? undefined,
      acceleration: model.acceleration ?? undefined,
      topSpeed: model.topSpeed ?? undefined,
      engineType: model.engineType ?? undefined,
      driveType: model.driveType ?? undefined,
      gearbox: model.gearbox ?? undefined,
      weight: model.weight ?? undefined,
      height: model.height ?? undefined,
      width: model.width ?? undefined,
      length: model.length ?? undefined,
      fuelSystem: model.fuelSystem ?? undefined,
      fuelHighway: model.fuelHighway ?? undefined,
      fuelUrban: model.fuelUrban ?? undefined,
      fuelCombined: model.fuelCombined ?? undefined
    }))
  }
}
