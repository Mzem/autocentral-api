import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'

export class CarMakeDto extends Model {
  @PrimaryKey
  @Column({ field: 'id', type: DataType.STRING })
  id: string

  @Column({ field: 'name', type: DataType.STRING })
  name: string

  @Column({ field: 'category', type: DataType.STRING })
  category: string | null

  @Column({ field: 'remap', type: DataType.BOOLEAN })
  remap: boolean
}

@Table({ timestamps: false, tableName: 'car_make' })
export class CarMakeSqlModel extends CarMakeDto {}
