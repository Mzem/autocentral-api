import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { CarRegistrationSqlModel } from '../../infrastructure/sequelize/models/car-registration.sql-model'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { Query } from '../types/query'
import { QueryHandler } from '../types/query-handler'

export class CarRegQueryModel {
  @ApiProperty()
  id: string
  @ApiProperty()
  registration: string
  @ApiProperty({ required: false })
  make?: string
  @ApiProperty({ required: false })
  model?: string
  @ApiProperty({ required: false })
  variant?: string
  @ApiProperty({ required: false })
  registrationDate?: string
  @ApiProperty({ required: false })
  fuel?: string
  @ApiProperty({ required: false })
  cv?: string
  @ApiProperty({ required: false })
  cylinder?: string
  @ApiProperty({ required: false })
  engine?: string
}

export interface FindCarRegQuery extends Query {
  reg: string
}

@Injectable()
export class FindCarRegQueryHandler extends QueryHandler<
  FindCarRegQuery,
  CarRegQueryModel
> {
  constructor() {
    super('FindCarRegQueryHandler')
  }

  async handle(query: FindCarRegQuery): Promise<Result<CarRegQueryModel>> {
    const regSQL = await CarRegistrationSqlModel.findOne({
      where: { registration: query.reg }
    })

    if (regSQL) {
      return success({
        id: regSQL.id,
        registration: regSQL.registration,
        make: regSQL.make ?? undefined,
        model: regSQL.model ?? undefined,
        registrationDate: regSQL.registrationDate ?? undefined,
        variant: regSQL.variant ?? undefined,
        fuel: regSQL.fuel ?? undefined,
        cv: regSQL.cv ?? undefined,
        cylinder: regSQL.cylinder ?? undefined,
        engine: regSQL.engine ?? undefined
      })
    }

    return NotFoundFailure('Car Registration', query.reg)
  }
}
