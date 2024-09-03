import { Controller, Get, Param, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import {
  CarRegQueryModel,
  GetCarRegQueryHandler
} from '../../application/queries/get-car-reg.query.handler.db'
import {
  ApiKeyAccessLevel,
  ApiKeyAuthGuard,
  METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL
} from '../../utils/auth/api-key.auth-guard'
import { handleResult } from '../../utils/result/result.handler'

@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('api_key')
@Controller('car-regs')
@ApiTags('Car Registrations')
export class CarRegsController {
  constructor(private readonly getCarRegQueryHandler: GetCarRegQueryHandler) {}

  @SetMetadata(METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL, ApiKeyAccessLevel.USER)
  @Get('/:reg')
  @ApiResponse({
    type: CarRegQueryModel
  })
  async getCarReg(@Param('reg') reg: string): Promise<CarRegQueryModel> {
    const result = await this.getCarRegQueryHandler.execute({ reg })
    return handleResult(result)
  }
}
