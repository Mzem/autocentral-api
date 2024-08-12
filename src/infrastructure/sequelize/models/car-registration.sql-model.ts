import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { CarModelSqlModel } from './car-model.sql-model'

export class CarRegistrationDto extends Model {
  @PrimaryKey
  @Column({ field: 'id' })
  id: string

  @ForeignKey(() => CarModelSqlModel)
  @Column({ field: 'id_car_model', type: DataType.STRING })
  idCarModel: string

  @Column({ field: 'manufacturer', type: DataType.STRING })
  make: string

  @Column({ field: 'model', type: DataType.STRING })
  model: string

  @Column({ field: 'model', type: DataType.STRING })
  variant: string

  @Column({ field: 'registration', type: DataType.STRING })
  registration: string

  @Column({ field: 'registration_date', type: DataType.STRING })
  registrationDate: string

  @Column({ field: 'type', type: DataType.STRING })
  type: string

  @Column({ field: 'fuel', type: DataType.STRING })
  fuel: string

  @Column({ field: 'fiscal_hp', type: DataType.STRING })
  fiscalHP: string

  @Column({ field: 'cylinder', type: DataType.STRING })
  cylinder: string

  @Column({ field: 'vin', type: DataType.STRING })
  vin: string

  @Column({ field: 'engine', type: DataType.STRING })
  engine: string

  @Column({ field: 'transmission', type: DataType.STRING })
  transmission: string

  @Column({ field: 'gearbox_code', type: DataType.STRING })
  gearboxCode: string

  @Column({ field: 'constructor_type', type: DataType.STRING })
  constructorType: string
}

@Table({ timestamps: false, tableName: 'car_registration' })
export class CarRegistrationSqlModel extends CarRegistrationDto {
  @BelongsTo(() => CarModelSqlModel)
  carModel: CarModelSqlModel
}
