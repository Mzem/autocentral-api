import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'

export class RegionDto extends Model {
  @PrimaryKey
  @Column({ field: 'id', type: DataType.STRING })
  id: string

  @Column({ field: 'name', type: DataType.STRING })
  name: string
}

@Table({ timestamps: false, tableName: 'region' })
export class RegionSqlModel extends RegionDto {}
