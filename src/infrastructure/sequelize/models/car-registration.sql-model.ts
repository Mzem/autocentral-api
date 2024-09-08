import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript'

export class CarRegistrationDto extends Model {
  @PrimaryKey
  @Column({ field: 'id', type: DataType.STRING })
  id: string

  @Unique
  @Column({ field: 'registration', type: DataType.STRING })
  registration: string

  @Column({ field: 'make', type: DataType.STRING })
  make: string | null

  @Column({ field: 'model', type: DataType.STRING })
  model: string | null

  @Column({ field: 'model', type: DataType.STRING })
  variant: string | null

  @Column({ field: 'registration_date', type: DataType.STRING })
  registrationDate: string | null

  @Column({ field: 'type', type: DataType.STRING })
  type: string | null

  @Column({ field: 'fuel', type: DataType.STRING })
  fuel: string | null

  @Column({ field: 'cv', type: DataType.STRING })
  cv: string | null

  @Column({ field: 'cylinder', type: DataType.STRING })
  cylinder: string | null

  @Column({ field: 'vin', type: DataType.STRING })
  vin: string | null

  @Column({ field: 'engine', type: DataType.STRING })
  engine: string | null

  @Column({ field: 'transmission', type: DataType.STRING })
  transmission: string | null

  @Column({ field: 'gearbox_code', type: DataType.STRING })
  gearboxCode: string | null

  @Column({ field: 'constructor_type', type: DataType.STRING })
  constructorType: string | null
}

@Table({ timestamps: false, tableName: 'car_registration' })
export class CarRegistrationSqlModel extends CarRegistrationDto {}
