import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { CarEngineSqlModel } from '../../infrastructure/sequelize/models/car-engine.sql-model'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'
import { CarMakeQueryModel } from './get-car-makes.query.handler.db'
import { mapMakeSQLToQueryModel } from './mappers'

export class CarModelsNamesQueryModel {
  @ApiProperty()
  make: CarMakeQueryModel

  @ApiProperty()
  models: string[]
}

export interface GetCarModelsNamesQuery extends Query {
  makeId: string
}

@Injectable()
export class GetCarModelsNamesQueryHandler extends QueryHandler<
  GetCarModelsNamesQuery,
  CarModelsNamesQueryModel
> {
  constructor() {
    super('GetCarModelsNamesQueryHandler')
  }

  async handle(
    query: GetCarModelsNamesQuery
  ): Promise<Result<CarModelsNamesQueryModel>> {
    const makeSQL = await CarMakeSqlModel.findByPk(query.makeId)

    if (!makeSQL) {
      return NotFoundFailure('Make', query.makeId)
    }

    const modelsSQL = await CarEngineSqlModel.findAll({
      attributes: ['model'],
      group: ['model'],
      where: {
        makeId: query.makeId
      },
      order: ['model']
    })

    return success({
      make: mapMakeSQLToQueryModel(makeSQL),
      models: modelsSQL.map(sql => sql.model)
    })
  }
}
