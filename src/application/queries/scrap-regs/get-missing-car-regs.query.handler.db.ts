import { Inject, Injectable } from '@nestjs/common'
import { QueryTypes, Sequelize } from 'sequelize'
import { SequelizeInjectionToken } from '../../../infrastructure/sequelize/providers'
import { Success, success } from '../../../utils/result/result'
import { QueryHandler } from '../../types/query-handler'

export interface GetMissingRSCarRegsQuery {
  startingRSMat?: number
  nbRegsMax?: number
}
@Injectable()
export class GetMissingRSCarRegsQueryHandler extends QueryHandler<
  GetMissingRSCarRegsQuery,
  string[]
> {
  constructor(
    @Inject(SequelizeInjectionToken) private readonly sequelize: Sequelize
  ) {
    super('GetMissingRSCarRegsQueryHandler')
  }

  async handle(query: GetMissingRSCarRegsQuery): Promise<Success<string[]>> {
    const startingRSMat = query.startingRSMat ?? getRandomNumber(30000, 240000)
    const missingRegsRawSQL: Array<{ missing_reg: string }> =
      await this.sequelize.query(
        `WITH possible_regs AS (
      SELECT generate_series(${startingRSMat}, ${
          startingRSMat + (query.nbRegsMax ?? 15)
        }) AS reg_num
      )
      SELECT
          reg_num || 'RS' AS missing_reg
      FROM
          possible_regs p
      LEFT JOIN
          car_registration c
      ON
          p.reg_num || 'RS' = c.registration
      WHERE
          c.registration IS NULL`,
        { type: QueryTypes.SELECT }
      )

    return success(missingRegsRawSQL.map(sql => sql.missing_reg))
  }
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
