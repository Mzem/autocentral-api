import { Injectable } from '@nestjs/common'
import * as uuid from 'uuid'
import {
  CarRegistrationDto,
  CarRegistrationSqlModel
} from '../../../infrastructure/sequelize/models/car-registration.sql-model'
import { AsSql } from '../../../infrastructure/sequelize/types'
import { buildError } from '../../../utils/monitoring/logger.module'
import { emptySuccess, Result } from '../../../utils/result/result'
import { sanitizeStringForDBInsert } from '../../../utils/utils'
import { QueryHandler } from '../../types/query-handler'

@Injectable()
// TODO passer en command
export class GetPostCarRegQueryHandler extends QueryHandler<
  { car: string; reg: string },
  void
> {
  constructor() {
    super('GetPostCarRegQueryHandler')
  }

  async handle(query: { car: string; reg: string }): Promise<Result<void>> {
    try {
      const car = JSON.parse(query.car)
      if (car.vin && car.vin.length > 3) {
        return emptySuccess()
      }
      const reg = query.reg
      const regSQL = await CarRegistrationSqlModel.findOne({
        where: { registration: sanitizeStringForDBInsert(reg) }
      })

      if (!regSQL && car.registration && car.manufacturer) {
        const dto: AsSql<CarRegistrationDto> = {
          id: uuid.v4(),
          registration: sanitizeStringForDBInsert(car.registration)!,
          make: sanitizeStringForDBInsert(car.manufacturer),
          model: sanitizeStringForDBInsert(car.model),
          variant: sanitizeStringForDBInsert(car.bodyType),
          registrationDate: sanitizeStringForDBInsert(car.inServiceDate),
          type: sanitizeStringForDBInsert(car.type),
          fuel: sanitizeStringForDBInsert(car.fuel),
          cv: sanitizeStringForDBInsert(car.fiscalPower),
          cylinder: sanitizeStringForDBInsert(car.cylinder),
          vin: sanitizeStringForDBInsert(car.vin),
          engine: sanitizeStringForDBInsert(car.engine),
          transmission: sanitizeStringForDBInsert(car.transmission),
          gearboxCode: sanitizeStringForDBInsert(car.gearboxCode),
          constructorType: sanitizeStringForDBInsert(car.constructorType),
          updateDate: null
        }
        await CarRegistrationSqlModel.upsert(dto, {
          conflictFields: ['registration']
        })
      }
    } catch (e) {
      this.logger.error(buildError('Error save car REG', e))
    }

    return emptySuccess()
  }
}
