import { Injectable } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import * as uuid from 'uuid'
import { RegsScaper } from '../../infrastructure/scrapers/regs.scraper'
import { CarRegistrationSqlModel } from '../../infrastructure/sequelize/models/car-registration.sql-model'
import { AsSql } from '../../infrastructure/sequelize/types'
import { NotFoundFailure } from '../../utils/result/error'
import { Result, success } from '../../utils/result/result'
import { sanitizeStringForDBInsert } from '../../utils/utils'
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
  constructor(private readonly regsScrapper: RegsScaper) {
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

    const scrappedReg = await this.regsScrapper.scrapReg(query.reg)
    if (scrappedReg) {
      const carRegDto: AsSql<CarRegistrationSqlModel> = {
        id: uuid.v4(),
        registration: query.reg,
        make: sanitizeStringForDBInsert(scrappedReg.make),
        model: sanitizeStringForDBInsert(scrappedReg.model),
        registrationDate: sanitizeStringForDBInsert(
          scrappedReg.registrationDate
        ),
        variant: sanitizeStringForDBInsert(scrappedReg.variant),
        fuel: sanitizeStringForDBInsert(scrappedReg.fuel),
        cv: sanitizeStringForDBInsert(scrappedReg.cv),
        cylinder: sanitizeStringForDBInsert(scrappedReg.cylinder),
        engine: sanitizeStringForDBInsert(scrappedReg.engine),
        vin: sanitizeStringForDBInsert(scrappedReg.vin),
        transmission: sanitizeStringForDBInsert(scrappedReg.transmission),
        gearboxCode: sanitizeStringForDBInsert(scrappedReg.gearboxCode),
        constructorType: sanitizeStringForDBInsert(scrappedReg.constructorType),
        type: sanitizeStringForDBInsert(scrappedReg.type),
        updateDate: null
      }
      await CarRegistrationSqlModel.upsert(carRegDto, {
        conflictFields: ['registration']
      })
      return success({
        id: 'test',
        registration:
          sanitizeStringForDBInsert(scrappedReg.registration) || query.reg,
        make: sanitizeStringForDBInsert(scrappedReg.make) || undefined,
        model: sanitizeStringForDBInsert(scrappedReg.model) || undefined,
        registrationDate:
          sanitizeStringForDBInsert(scrappedReg.registrationDate) || undefined,
        variant: sanitizeStringForDBInsert(scrappedReg.variant) || undefined,
        fuel: sanitizeStringForDBInsert(scrappedReg.fuel) || undefined,
        cv: sanitizeStringForDBInsert(scrappedReg.cv) || undefined,
        cylinder: sanitizeStringForDBInsert(scrappedReg.cylinder) || undefined,
        engine: sanitizeStringForDBInsert(scrappedReg.engine) || undefined
      })
    }

    return NotFoundFailure('Car Registration', query.reg)
  }
}
