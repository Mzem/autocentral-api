import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common'
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiSecurity,
  ApiTags
} from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator'
import {
  CarPostListItemQueryModel,
  FindCarPostsQueryHandler
} from '../../application/queries/find-car-posts.query.handler.db'
import {
  ApiKeyAccessLevel,
  ApiKeyAuthGuard,
  METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL
} from '../../utils/auth/api-key.auth-guard'
import { handleResult } from '../../utils/result/result.handler'
import { Fuel, Gearbox, Transmission } from '../../domain/car-model'
import { Color, InteriorType } from '../../domain/car-post'

class FindCarPostsQP {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  merchantId?: string
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  make?: string
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  model?: string
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  regionId?: string
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Fuel)
  @IsOptional()
  fuel?: Fuel
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Color)
  @IsOptional()
  color?: Color
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Gearbox)
  @IsOptional()
  gearbox?: Gearbox
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(InteriorType)
  @IsOptional()
  interiorType?: InteriorType
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Transmission)
  @IsOptional()
  transmission?: Transmission
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxPrice: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxKm: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minYear: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxYear: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minCV: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxCV: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minHP: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxHP: number
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  carPlay: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  bluetooth: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  sunroof: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  alarm: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  acAuto: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  ledLights: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  ledInterior: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  keyless: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  aluRims: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  exchange: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  leasing: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  camera: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  firstOwner: boolean
}

@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('api_key')
@Controller('car-posts')
@ApiTags('Car Posts')
export class CarPostsController {
  constructor(
    private readonly findCarPostsQueryHandler: FindCarPostsQueryHandler
  ) {}

  @SetMetadata(METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL, ApiKeyAccessLevel.USER)
  @Get('/')
  @ApiResponse({
    type: CarPostListItemQueryModel,
    isArray: true
  })
  async getCarReg(
    @Query() queryParams: FindCarPostsQP
  ): Promise<CarPostListItemQueryModel[]> {
    const result = await this.findCarPostsQueryHandler.execute({
      ...queryParams
    })
    return handleResult(result)
  }
}
