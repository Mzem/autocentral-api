import { CarMakeDto } from '../../infrastructure/sequelize/models/car-make.sql-model'
import { CarMakeQueryModel } from './get-car-makes.query.handler.db'

export function mapEngineYears(fromYear: string, toYear: string): string {
  let years = ''
  if (fromYear === 'all' || toYear === 'all') {
    years = 'all'
  } else {
    if (fromYear === 'unknown') {
      years += '...'
    } else {
      years += fromYear
    }

    if (toYear === 'present' || toYear === 'unknown') {
      years += ' > ...'
    } else {
      years += ` > ${toYear}`
    }
  }
  return years
}

export function mapMakeSQLToQueryModel(makeSql: CarMakeDto): CarMakeQueryModel {
  return {
    id: makeSql.id,
    name: makeSql.name,
    category: makeSql.category ?? undefined,
    remap: makeSql.remap
  }
}
