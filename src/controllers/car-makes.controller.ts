import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import {
  CarMakeQueryModel,
  GetCarMakesQueryHandler
} from '../application/queries/get-car-makes.query.handler.db'
import {
  ApiKeyAccessLevel,
  ApiKeyAuthGuard,
  METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL
} from '../utils/auth/api-key.auth-guard'
import { handleResult } from '../utils/result/result.handler'

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
  @ApiResponse({
    type: CarMakeQueryModel,
    isArray: true
  })
  async getCarMakes(): Promise<CarMakeQueryModel[]> {
    const result = await this.getCarMakesQueryHandler.execute()
    return handleResult(result)
  }
}
