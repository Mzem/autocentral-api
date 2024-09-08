import {
  Controller,
  Get,
  Param,
  Query,
  SetMetadata,
  UseGuards
} from '@nestjs/common'
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import {
  CarRegQueryModel,
  GetCarRegQueryHandler
} from '../../application/queries/get-car-reg.query.handler.db'
import { GetPostCarRegNullQueryHandler } from '../../application/queries/get-post-car-reg-null.query.handler.db'
import { GetPostCarRegQueryHandler } from '../../application/queries/get-post-car-reg.query.handler.db'
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
  constructor(
    private readonly getCarRegQueryHandler: GetCarRegQueryHandler,
    private readonly getPostCarReg: GetPostCarRegQueryHandler,
    private readonly getPostCarRegNull: GetPostCarRegNullQueryHandler
  ) {}

  @SetMetadata(METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL, ApiKeyAccessLevel.USER)
  @Get('/:reg')
  @ApiResponse({
    type: CarRegQueryModel
  })
  async getCarReg(@Param('reg') reg: string): Promise<CarRegQueryModel> {
    const result = await this.getCarRegQueryHandler.execute({ reg })
    return handleResult(result)
  }

  @SetMetadata(
    METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL,
    ApiKeyAccessLevel.ADMIN
  )
  @Get('')
  async saveReg(@Query('car') car: string): Promise<void> {
    await this.getPostCarReg.execute({ car })
  }

  @SetMetadata(
    METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL,
    ApiKeyAccessLevel.ADMIN
  )
  @Get('/null/reg')
  async saveNullReg(@Query('reg') reg: string): Promise<void> {
    await this.getPostCarRegNull.execute({ reg })
  }
}
