import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { CarEngineSqlModel } from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { CarMakeQueryModel } from './get-car-makes.query.handler.db'
import { mapEngineYears } from './mappers'

class Engine {
  @ApiProperty()
  id: string
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
class ModelListItem {
  @ApiProperty()
  years: string
  @ApiProperty()
  engine: Engine
}

export class CarModelListQueryModel {
  @ApiProperty()
  make: CarMakeQueryModel

  @ApiProperty()
  modelName: string

  @ApiProperty()
  modelList: ModelListItem[]
}

export interface GetCarModelListQuery extends Query {
  makeId: string
  modelName: string
}

@Injectable()
export class GetCarModelListQueryHandler extends QueryHandler<
  GetCarModelListQuery,
  CarModelListQueryModel
> {
  constructor() {
    super('GetCarModelListQueryHandler')
  }

  async handle(
    query: GetCarModelListQuery
  ): Promise<Result<CarModelListQueryModel>> {
    const makeSQL = await CarMakeSqlModel.findByPk(query.makeId)

    if (!makeSQL) {
      return NotFoundFailure('Make', query.makeId)
    }

    const modelsSQL = await CarEngineSqlModel.findAll({
      where: {
        makeId: query.makeId,
        model: query.modelName
      }
    })

    return success({
      make: {
        id: makeSQL.id,
        name: makeSQL.name,
        category: makeSQL.category ?? undefined
      },
      modelName: query.modelName,
      modelList: modelsSQL.map(sql => {
        return {
          years: mapEngineYears(sql.fromYear, sql.toYear),
          engine: {
            id: sql.id,
            type: sql.type ?? undefined,
            engineName: sql.engineName ?? undefined,
            cylinder: sql.cylinder ?? undefined,
            fuel: sql.fuel ?? undefined,
            hp: sql.hp ?? undefined,
            hpRemap: sql.hpRemap ?? undefined,
            torque: sql.torque ?? undefined,
            torqueRemap: sql.torqueRemap ?? undefined,
            urlSource: sql.urlSource ?? undefined
          }
        }
      })
    })
  }
}
