import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { RegionSqlModel } from './region.sql-model'
import { CarEngineSqlModel } from './car-engine.sql-model'
import { Fuel, Gearbox, Transmission } from '../../../domain/car-model'
import { BodyType, Color, InteriorType, Source } from '../../../domain/car-post'
import { MerchantSqlModel } from './merchant.sql-model'

export class CarPostColdDto extends Model {
  @PrimaryKey
  @Column({ field: 'id', type: DataType.STRING })
  id: string

  @Column({ field: 'source', type: DataType.STRING })
  source: Source

  @Column({ field: 'id_source', type: DataType.STRING })
  idSource: string | null

  @Column({ field: 'url_source', type: DataType.STRING })
  urlSource: string | null

  @ForeignKey(() => MerchantSqlModel)
  @Column({ field: 'merchant_id', type: DataType.STRING })
  merchantId: string

  @Column({ field: 'published_at', type: DataType.DATE })
  publishedAt: Date

  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date | null

  @ForeignKey(() => RegionSqlModel)
  @Column({ field: 'region_id', type: DataType.STRING })
  regionId: string | null

  @Column({ field: 'region_detail', type: DataType.STRING })
  regionDetail: string | null

  @Column({ field: 'phone_numbers', type: DataType.ARRAY(DataType.INTEGER) })
  phoneNumbers: number[]

  @Column({ field: 'title', type: DataType.STRING })
  title: string | null

  @Column({ field: 'description', type: DataType.STRING })
  description: string | null

  @Column({ field: 'images', type: DataType.ARRAY(DataType.STRING) })
  images: string[]

  @Column({ field: 'price', type: DataType.INTEGER })
  price: number | null

  @ForeignKey(() => CarEngineSqlModel)
  @Column({ field: 'car_engine_id', type: DataType.STRING })
  carEngineId: string | null

  @Column({ field: 'make', type: DataType.STRING })
  make: string | null

  @Column({ field: 'model', type: DataType.STRING })
  model: string | null

  @Column({ field: 'body', type: DataType.STRING })
  body: BodyType | null

  @Column({ field: 'variant', type: DataType.STRING })
  variant: string | null

  @Column({ field: 'type', type: DataType.STRING })
  type: string | null

  @Column({ field: 'year', type: DataType.INTEGER })
  year: number | null

  @Column({ field: 'km', type: DataType.INTEGER })
  km: number | null

  @Column({ field: 'fuel', type: DataType.STRING })
  fuel: Fuel | null

  @Column({ field: 'cv', type: DataType.INTEGER })
  cv: number | null

  @Column({ field: 'hp', type: DataType.INTEGER })
  hp: number | null

  @Column({ field: 'engine', type: DataType.STRING })
  engine: string | null

  @Column({ field: 'cylinder', type: DataType.STRING })
  cylinder: string | null

  @Column({ field: 'color', type: DataType.STRING })
  color: Color | null

  @Column({ field: 'gearbox', type: DataType.STRING })
  gearbox: Gearbox | null

  @Column({ field: 'interior_type', type: DataType.STRING })
  interiorType: InteriorType | null

  @Column({ field: 'interior_color', type: DataType.STRING })
  interiorColor: Color | null

  @Column({ field: 'transmission', type: DataType.STRING })
  transmission: Transmission | null

  @Column({ field: 'car_play', type: DataType.BOOLEAN })
  carPlay: boolean | null

  @Column({ field: 'bluetooth', type: DataType.BOOLEAN })
  bluetooth: boolean | null

  @Column({ field: 'sunroof', type: DataType.BOOLEAN })
  sunroof: boolean | null

  @Column({ field: 'alarm', type: DataType.BOOLEAN })
  alarm: boolean | null

  @Column({ field: 'ac_auto', type: DataType.BOOLEAN })
  acAuto: boolean | null

  @Column({ field: 'led_lights', type: DataType.BOOLEAN })
  ledLights: boolean | null

  @Column({ field: 'led_interior', type: DataType.BOOLEAN })
  ledInterior: boolean | null

  @Column({ field: 'keyless', type: DataType.BOOLEAN })
  keyless: boolean | null

  @Column({ field: 'alu_rims', type: DataType.BOOLEAN })
  aluRims: boolean | null

  @Column({ field: 'warranty', type: DataType.BOOLEAN })
  warranty: boolean | null

  @Column({ field: 'exchange', type: DataType.BOOLEAN })
  exchange: boolean | null

  @Column({ field: 'leasing', type: DataType.BOOLEAN })
  leasing: boolean | null

  @Column({ field: 'fcr', type: DataType.BOOLEAN })
  fcr: boolean | null

  @Column({ field: 'camera', type: DataType.BOOLEAN })
  camera: boolean | null

  @Column({ field: 'first_owner', type: DataType.BOOLEAN })
  firstOwner: boolean | null

  @Column({ field: 'is_featured', type: DataType.BOOLEAN })
  isFeatured: boolean

  @Column({ field: 'is_expired', type: DataType.BOOLEAN })
  isExpired: boolean

  @Column({ field: 'new_url', type: DataType.STRING })
  newURL: string | null

  @Column({ field: 'new_price', type: DataType.INTEGER })
  newPrice: number | null

  @Column({ field: 'estimated_price', type: DataType.INTEGER })
  estimatedPrice: number | null

  @Column({ field: 'thumbnail', type: DataType.STRING })
  thumbnail: string | null

  @Column({ field: 'options', type: DataType.ARRAY(DataType.STRING) })
  options: string[] | null
}

@Table({ timestamps: false, tableName: 'car_post_cold' })
export class CarPostColdSqlModel extends CarPostColdDto {
  @BelongsTo(() => RegionSqlModel)
  region?: RegionSqlModel

  @BelongsTo(() => MerchantSqlModel)
  merchant?: MerchantSqlModel

  @BelongsTo(() => CarEngineSqlModel)
  carEngine?: CarEngineSqlModel
}
