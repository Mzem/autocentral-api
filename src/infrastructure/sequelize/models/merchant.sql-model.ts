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
import { Merchant } from '../../../domain/merchant'

export class MerchantDto extends Model {
  @PrimaryKey
  @Column({ field: 'id', type: DataType.STRING })
  id: string

  @Column({ field: 'name', type: DataType.STRING })
  name: string

  @Column({ field: 'description', type: DataType.STRING })
  description: string | null

  @Column({ field: 'avatar', type: DataType.STRING })
  avatar: string | null

  @Column({ field: 'is_shop', type: DataType.BOOLEAN })
  isShop: boolean

  @Column({ field: 'categories', type: DataType.ARRAY(DataType.STRING) })
  categories: Merchant.Category[]

  @Column({ field: 'phone_numbers', type: DataType.ARRAY(DataType.INTEGER) })
  phoneNumbers: number[]

  @Column({ field: 'insta_id', type: DataType.STRING })
  instaId: string | null

  @Column({ field: 'fb_id', type: DataType.STRING })
  fbId: string | null

  @Column({ field: 'website', type: DataType.STRING })
  website: string | null

  @Column({ field: 'address', type: DataType.STRING })
  address: string | null

  @Column({ field: 'gmaps_link', type: DataType.STRING })
  gmapsLink: string | null

  @ForeignKey(() => RegionSqlModel)
  @Column({ field: 'region_id', type: DataType.STRING })
  regionId: string | null

  @Column({ field: 'region_detail', type: DataType.STRING })
  regionDetail: string | null

  @Column({ field: 'id_tayara', type: DataType.STRING })
  idTayara: string | null

  @Column({ field: 'id_automobiletn', type: DataType.STRING })
  idAutomobiletn: string | null
}

@Table({ timestamps: false, tableName: 'merchant' })
export class MerchantSqlModel extends MerchantDto {
  @BelongsTo(() => RegionSqlModel)
  region?: RegionSqlModel
}
