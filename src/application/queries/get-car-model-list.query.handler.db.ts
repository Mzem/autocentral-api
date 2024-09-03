import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { CarEngineSqlModel } from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { CarMakeQueryModel } from './get-car-makes.query.handler.db'
import { mapEngineYears, mapMakeSQLToQueryModel } from './mappers'

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
}
class ModelYearsListItem {
  @ApiProperty()
  years: string
  @ApiProperty({ type: Engine, isArray: true })
  engines: Engine[]
}
class ModelListItem {
  @ApiProperty()
  modelName: string
  @ApiProperty({ type: ModelYearsListItem, isArray: true })
  modelYears: ModelYearsListItem[]
}

export class CarModelListQueryModel {
  @ApiProperty()
  make: CarMakeQueryModel

  @ApiProperty({ type: ModelListItem, isArray: true })
  models: ModelListItem[]
}

export interface GetCarModelListQuery extends Query {
  makeId: string
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
        makeId: query.makeId
      }
    })

    const groupedByModels: ModelListItem[] = modelsSQL.reduce(
      (groupedModels: ModelListItem[], modelSQL: CarEngineSqlModel) => {
        const currentModelName = modelSQL.model
        const existingModelName = groupedModels.find(
          model => model.modelName === currentModelName
        )

        const currentModelYears = mapEngineYears(
          modelSQL.fromYear,
          modelSQL.toYear
        )

        if (existingModelName) {
          const existingModelYears = existingModelName.modelYears.find(
            modelYears => modelYears.years === currentModelYears
          )

          if (existingModelYears) {
            // If it exists, push the engine to the existing engines array
            existingModelYears.engines.push(sqlToEngine(modelSQL))
          } else {
            // Otherwise, create a new entry in the accumulator
            existingModelName.modelYears.push({
              years: currentModelYears,
              engines: [sqlToEngine(modelSQL)]
            })
          }
        } else {
          groupedModels.push({
            modelName: currentModelName,
            modelYears: [
              {
                years: currentModelYears,
                engines: [sqlToEngine(modelSQL)]
              }
            ]
          })
        }

        return groupedModels
      },
      []
    )

    return success({
      make: mapMakeSQLToQueryModel(makeSQL),
      models: groupedByModels
    })
  }
}

function sqlToEngine(modelSQL: CarEngineSqlModel): Engine {
  return {
    id: modelSQL.id,
    type: modelSQL.type ?? undefined,
    engineName: modelSQL.engineName ?? undefined,
    cylinder: modelSQL.cylinder ?? undefined,
    fuel: modelSQL.fuel ?? undefined,
    hp: modelSQL.hp ?? undefined
  }
}
