import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { CarEngineSqlModel } from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { mapMakeSQLToQueryModel } from './mappers'
import { CarMakeQueryModel } from './query-models'
import { sortByStringField } from '../helpers'

class Engine {
  @ApiProperty()
  id: string
  @ApiProperty({ required: false })
  type?: string
  @ApiProperty()
  year: number | null
  @ApiProperty({ required: false })
  engineName?: string
  @ApiProperty({ required: false })
  cylinder?: string
  @ApiProperty({ required: false })
  fuel?: string
  @ApiProperty({ required: false })
  hp?: number
}
class ModelYearListItem {
  @ApiProperty()
  year: number
  @ApiProperty({ type: Engine, isArray: true })
  engines: Engine[]
}
class ModelListItem {
  @ApiProperty()
  modelName: string
  @ApiProperty({ type: ModelYearListItem, isArray: true })
  modelYears: ModelYearListItem[]
}

export class CarModelListQueryModel {
  @ApiProperty()
  make: CarMakeQueryModel

  @ApiProperty({ type: ModelListItem, isArray: true })
  models: ModelListItem[]
}

export interface FindCarModelsQuery extends Query {
  makeId: string
}

@Injectable()
export class FindCarModelsQueryHandler extends QueryHandler<
  FindCarModelsQuery,
  CarModelListQueryModel
> {
  constructor() {
    super('FindCarModelsQueryHandler')
  }

  async handle(
    query: FindCarModelsQuery
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

        const currentModelYear = modelSQL.fromYear || 2000

        if (existingModelName) {
          const existingModelYears = existingModelName.modelYears.find(
            modelYears => modelYears.year === currentModelYear
          )

          if (existingModelYears) {
            // If it exists, push the engine to the existing engines array
            existingModelYears.engines.push(sqlToEngine(modelSQL))
          } else {
            // Otherwise, create a new entry in the accumulator
            existingModelName.modelYears.push({
              year: currentModelYear,
              engines: [sqlToEngine(modelSQL)]
            })
          }
        } else {
          groupedModels.push({
            modelName: currentModelName,
            modelYears: [
              {
                year: currentModelYear,
                engines: [sqlToEngine(modelSQL)]
              }
            ]
          })
        }

        return groupedModels
      },
      []
    )

    const eachModelSortedByYear = groupedByModels.map(model => ({
      ...model,
      modelYears: sortByStringField(model.modelYears, 'year')
    }))

    return success({
      make: mapMakeSQLToQueryModel(makeSQL),
      models: sortByStringField(eachModelSortedByYear, 'modelName')
    })
  }
}

function sqlToEngine(modelSQL: CarEngineSqlModel): Engine {
  return {
    id: modelSQL.id,
    type: modelSQL.type ?? undefined,
    year: modelSQL.fromYear,
    engineName: modelSQL.engineName ?? undefined,
    cylinder: modelSQL.cylinder ?? undefined,
    fuel: modelSQL.fuel ?? undefined,
    hp: modelSQL.hp ?? undefined
  }
}
