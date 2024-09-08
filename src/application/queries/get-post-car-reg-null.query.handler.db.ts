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
export class GetPostCarRegNullQueryHandler extends QueryHandler<
  { reg: string },
  void
> {
  constructor() {
    super('GetPostCarRegNullQueryHandler')
  }

  async handle(query: { reg: string }): Promise<Result<void>> {
    try {
      const reg = query.reg
      const regSQL = await CarRegistrationSqlModel.findOne({
        where: { registration: `"${reg}"` }
      })

      if (!regSQL) {
        const dto: AsSql<CarRegistrationDto> = {
          id: uuid.v4(),
          make: null,
          model: null,
          variant: null,
          registration: reg,
          registrationDate: null,
          type: null,
          fuel: null,
          fiscalHp: null,
          cylinder: null,
          vin: null,
          engine: null,
          transmission: null,
          gearboxCode: null,
          constructorType: null
        }
        await CarRegistrationSqlModel.upsert(dto)
      }
    } catch (e) {
      this.logger.error(buildError('Error save car REG', e))
    }

    return emptySuccess()
  }
}
