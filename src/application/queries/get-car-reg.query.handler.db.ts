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
  @ApiProperty({ required: false })
  make?: string
  @ApiProperty({ required: false })
  model?: string
  @ApiProperty({ required: false })
  variant?: string
  @ApiProperty()
  registration: string
  @ApiProperty({ required: false })
  registrationDate?: string
  @ApiProperty({ required: false })
  fuel?: string
  @ApiProperty({ required: false })
  fiscalHp?: string
  @ApiProperty({ required: false })
  cylinder?: string
  @ApiProperty({ required: false })
  engine?: string
}

export interface GetCarRegQuery extends Query {
  reg: string
}

@Injectable()
export class GetCarRegQueryHandler extends QueryHandler<
  GetCarRegQuery,
  CarRegQueryModel
> {
  constructor() {
    super('GetCarRegQueryHandler')
  }

  async handle(query: GetCarRegQuery): Promise<Result<CarRegQueryModel>> {
    const regSQL = await CarRegistrationSqlModel.findOne({
      where: { registration: `"${query.reg}"` }
    })

    if (!regSQL) {
      return NotFoundFailure('Car Registration', query.reg)
    }

    return success({
      id: regSQL.id,
      make: regSQL.make ?? undefined,
      model: regSQL.model ?? undefined,
      registrationDate: regSQL.registrationDate ?? undefined,
      registration: query.reg,
      variant: regSQL.variant ?? undefined,
      fuel: regSQL.fuel ?? undefined,
      fiscalHp: regSQL.fiscalHp ?? undefined,
      cylinder: regSQL.cylinder ?? undefined,
      engine: regSQL.engine ?? undefined
    })
  }
}
