import { ApiProperty } from '@nestjs/swagger'

export class CarMakeQueryModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ required: false })
  category?: string

  @ApiProperty()
  remap: boolean
}

export class RegionQueryModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string
}

export class MerchantQueryModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ required: false })
  avatar?: string

  @ApiProperty()
  isShop: boolean
}
