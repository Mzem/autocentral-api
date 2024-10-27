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
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  IsArray,
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
  CarPostQueryModel,
  GetCarPostQueryHandler
} from '../../application/queries/get-car-post.query.handler.db'
import { Fuel, Transmission } from '../../domain/car-model'
import { Color, InteriorType } from '../../domain/car-post'
import {
  ApiKeyAccessLevel,
  ApiKeyAuthGuard,
  METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL
} from '../../utils/auth/api-key.auth-guard'
import { handleResult } from '../../utils/result/result.handler'

function transformStringToArray(params: TransformFnParams, key: string): [] {
  if (typeof params.value === 'string') {
    params.obj[key] = [params.value]
  }
  return params.obj[key]
}

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
  @IsOptional()
  @Transform(params => transformStringToArray(params, 'regionIds'))
  @IsArray()
  regionIds?: string[]
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
  maxPrice?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxKm?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minYear?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxYear?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minCV?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxCV?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minHP?: number
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxHP?: number
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isAuto?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  carPlay?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  bluetooth?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  sunroof?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  alarm?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  acAuto?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  ledLights?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  ledInterior?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  keyless?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  aluRims?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  exchange?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  leasing?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  camera?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  firstOwner?: boolean
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isShop?: boolean
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  q?: string
}

@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('api_key')
@Controller('car-posts')
@ApiTags('Car Posts')
export class CarPostsController {
  constructor(
    private readonly findCarPostsQueryHandler: FindCarPostsQueryHandler,
    private readonly getCarPostQueryHandler: GetCarPostQueryHandler
  ) {}

  @SetMetadata(METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL, ApiKeyAccessLevel.USER)
  @Get('/')
  @ApiResponse({
    type: CarPostListItemQueryModel,
    isArray: true
  })
  async findCarPosts(
    @Query() queryParams: FindCarPostsQP
  ): Promise<CarPostListItemQueryModel[]> {
    const result = await this.findCarPostsQueryHandler.execute({
      ...queryParams
    })
    return handleResult(result)
  }
  @SetMetadata(METADATA_IDENTIFIER_API_KEY_ACCESS_LEVEL, ApiKeyAccessLevel.USER)
  @Get('/:carPostId')
  @ApiResponse({
    type: CarPostListItemQueryModel,
    isArray: true
  })
  async getCarPostId(
    @Param('carPostId') carPostId: string
  ): Promise<CarPostQueryModel> {
    const result = await this.getCarPostQueryHandler.execute({ carPostId })
    return handleResult(result)
  }
}
