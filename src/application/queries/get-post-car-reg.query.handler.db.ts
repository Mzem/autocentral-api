import { Injectable } from '@nestjs/common'
import {
  CarRegistrationDto,
  CarRegistrationSqlModel
} from '../../infrastructure/sequelize/models/car-registration.sql-model'
import { emptySuccess, Result } from '../../utils/result/result'
import { QueryHandler } from '../types/query-handler'
import { buildError } from '../../utils/monitoring/logger.module'
import * as uuid from 'uuid'
import { AsSql } from '../../infrastructure/sequelize/types'

@Injectable()
// TODO passer en command
export class GetPostCarRegQueryHandler extends QueryHandler<
  { car: string },
  void
> {
  constructor() {
    super('GetPostCarRegQueryHandler')
  }

  async handle(query: { car: string }): Promise<Result<void>> {
    try {
      const reg = JSON.parse(query.car)
      const regSQL = await CarRegistrationSqlModel.findOne({
        where: { registration: `"${reg.registration}"` }
      })

      if (!regSQL) {
        const dto: AsSql<CarRegistrationDto> = {
          id: uuid.v4(),
          make: reg.manufacturer || null,
          model: reg.model || null,
          variant: reg.bodyType || null,
          registration: reg.registration,
          registrationDate: reg.inServiceDate || null,
          type: reg.type || null,
          fuel: reg.fuel || null,
          fiscalHp: reg.fiscalPower || null,
          cylinder: reg.cylinder || null,
          vin: reg.vin || null,
          engine: reg.engine || null,
          transmission: reg.transmission || null,
          gearboxCode: reg.gearboxCode || null,
          constructorType: reg.constructorType || null
        }
        await CarRegistrationSqlModel.upsert(dto)
      }
    } catch (e) {
      this.logger.error(buildError('Error save car REG', e))
    }

    return emptySuccess()
  }
}
