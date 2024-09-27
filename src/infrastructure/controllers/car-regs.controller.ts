import {
  Controller,
  Get,
  Param,
  Query,
  SetMetadata,
  UseGuards
} from '@nestjs/common'
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiSecurity,
  ApiTags
} from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import {
  CarRegQueryModel,
  GetCarRegQueryHandler
} from '../../application/queries/get-car-reg.query.handler.db'
import { GetMissingRSCarRegsQueryHandler } from '../../application/queries/scrap-regs/get-missing-car-regs.query.handler.db'
import { GetPostCarRegNullQueryHandler } from '../../application/queries/scrap-regs/get-post-car-reg-null.query.handler.db'
import { GetPostCarRegQueryHandler } from '../../application/queries/scrap-regs/get-post-car-reg.query.handler.db'
import {
  ApiKeyAccessLevel,
  ApiKeyAuthGuard,
  METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL
} from '../../utils/auth/api-key.auth-guard'
import { isSuccess } from '../../utils/result/result'
import { handleResult } from '../../utils/result/result.handler'
import { Type } from 'class-transformer'

export class GetPostCarRegQP {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  car: string
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reg: string
}

export class GetPostCarRegNullQP {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reg: string
}

export class GetMissingRSRegsQP {
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  startingRSMat?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  nbRegsMax?: number
}

@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('api_key')
@Controller('car-regs')
@ApiTags('Car Registrations')
export class CarRegsController {
  constructor(
    private readonly getCarRegQueryHandler: GetCarRegQueryHandler,
    private readonly getPostCarReg: GetPostCarRegQueryHandler,
    private readonly getPostCarRegNull: GetPostCarRegNullQueryHandler,
    private readonly getMissingCarRegsQueryHandler: GetMissingRSCarRegsQueryHandler
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
    ApiKeyAccessLevel.SCRIPT
  )
  @Get('')
  async saveReg(@Query() getPostCarRegQP: GetPostCarRegQP): Promise<void> {
    await this.getPostCarReg.execute(getPostCarRegQP)
  }

  @SetMetadata(
    METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL,
    ApiKeyAccessLevel.SCRIPT
  )
  @Get('/null/reg')
  async saveNullReg(
    @Query() getPostCarRegNullQP: GetPostCarRegNullQP
  ): Promise<void> {
    await this.getPostCarRegNull.execute(getPostCarRegNullQP)
  }

  @SetMetadata(
    METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL,
    ApiKeyAccessLevel.SCRIPT
  )
  @Get('/missing/rs-regs')
  async getMissingRegs(
    @Query() getMissingRegsQP: GetMissingRSRegsQP
  ): Promise<string[]> {
    const result = await this.getMissingCarRegsQueryHandler.execute(
      getMissingRegsQP
    )
    if (isSuccess(result)) {
      return result.data
    }
    return []
  }
}
