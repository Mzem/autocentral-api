import { CarMakeDto } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { CarMakeQueryModel } from './query-models'

export function mapMakeSQLToQueryModel(makeSql: CarMakeDto): CarMakeQueryModel {
  return {
    id: makeSql.id,
    name: makeSql.name,
    category: makeSql.category ?? undefined,
    remap: makeSql.remap
  }
}
