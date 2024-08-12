import {
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { CarRegistrationSqlModel } from './car-registration.sql-model'

export class CarModelDto extends Model {
  @PrimaryKey
  @Column({ field: 'id' })
  id: string

  @Column({ field: 'manufacturer', type: DataType.STRING })
  make: string

  @Column({ field: 'model', type: DataType.STRING })
  model: string
}

@Table({ timestamps: false, tableName: 'car_model' })
export class CarModelSqlModel extends CarModelDto {
  @HasMany(() => CarRegistrationSqlModel)
  carRegistrations!: CarRegistrationSqlModel[]
}
