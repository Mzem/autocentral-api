import { Injectable } from '@nestjs/common'
import { CarMakeSqlModel } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { Result, success } from '../../utils/result/result'
import { QueryHandler } from '../types/query-handler'
import { mapMakeSQLToQueryModel } from './mappers'
import { CarMakeQueryModel } from './query-models'

@Injectable()
export class GetCarMakesQueryHandler extends QueryHandler<
  void,
  CarMakeQueryModel[]
> {
  constructor() {
    super('GetCarMakesQueryHandler')
  }

  async handle(): Promise<Result<CarMakeQueryModel[]>> {
    const sqlModels = await CarMakeSqlModel.findAll({ order: ['name'] })
    return success(
      sqlModels.filter(sql => sql.category).map(mapMakeSQLToQueryModel)
    )
  }
}
