import { Controller, Get, Header, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { GetCarMakesQueryHandler } from '../../application/queries/get-car-makes.query.handler.db'
import {
  ApiKeyAccessLevel,
  ApiKeyAuthGuard,
  METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL
} from '../../utils/auth/api-key.auth-guard'
import { handleResult } from '../../utils/result/result.handler'
import { CarMakeQueryModel } from '../../application/queries/query-models'

@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('api_key')
@Controller('car-makes')
@ApiTags('Car Makes')
export class CarMakesController {
  constructor(
    private readonly getCarMakesQueryHandler: GetCarMakesQueryHandler
  ) {}

  @SetMetadata(METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL, ApiKeyAccessLevel.USER)
  @Get('/')
  @Header('Cache-Control', 'max-age=86400')
  @ApiResponse({
    type: CarMakeQueryModel,
    isArray: true
  })
  async getCarMakes(): Promise<CarMakeQueryModel[]> {
    const result = await this.getCarMakesQueryHandler.execute()
    return handleResult(result)
  }
}
