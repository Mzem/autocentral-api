import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { CarMakeSqlModel } from './car-make.sql-model'
import { Fuel } from '../../../domain/car-model'

export class CarModelDto extends Model {
  @PrimaryKey
  @Column({ field: 'id' })
  id: string

  @ForeignKey(() => CarMakeSqlModel)
  @Column({ field: 'make_id', type: DataType.STRING })
  makeId: string

  @Column({ field: 'model', type: DataType.STRING })
  model: string

  @Column({ field: 'from_year', type: DataType.STRING })
  fromYear: string | null

  @Column({ field: 'to_year', type: DataType.STRING })
  toYear: string | null

  @Column({ field: 'production_years', type: DataType.STRING })
  productionYears: string | null

  @Column({ field: 'model_start_year', type: DataType.STRING })
  modelStartYear: string | null

  @Column({ field: 'model_end_year', type: DataType.STRING })
  modelEndYear: string | null

  @Column({ field: 'engine_name', type: DataType.STRING })
  engineName: string | null

  @Column({ field: 'engine_detail', type: DataType.STRING })
  engineDetail: string | null

  @Column({ field: 'engine_type', type: DataType.STRING })
  engineType: string | null

  @Column({ field: 'displacement', type: DataType.STRING })
  displacement: string | null

  @Column({ field: 'cylinder', type: DataType.STRING })
  cylinder: string | null

  @Column({ field: 'body', type: DataType.STRING })
  body: string | null

  @Column({ field: 'fuel', type: DataType.STRING })
  fuel: Fuel | null

  @Column({ field: 'hp', type: DataType.INTEGER })
  hp: number | null

  @Column({ field: 'hp_detail', type: DataType.STRING })
  hpDetail: string | null

  @Column({ field: 'torque', type: DataType.INTEGER })
  torque: number | null

  @Column({ field: 'torque_detail', type: DataType.STRING })
  torqueDetail: string | null

  @Column({ field: 'electric_hp', type: DataType.INTEGER })
  electricHp: number | null

  @Column({ field: 'acceleration', type: DataType.DOUBLE })
  acceleration: number | null

  @Column({ field: 'top_speed', type: DataType.INTEGER })
  topSpeed: number | null

  @Column({ field: 'fuel_system', type: DataType.STRING })
  fuelSystem: string | null

  @Column({ field: 'fuel_capacity', type: DataType.STRING })
  fuelCapacity: string | null

  @Column({ field: 'fuel_highway', type: DataType.STRING })
  fuelHighway: string | null

  @Column({ field: 'fuel_urban', type: DataType.STRING })
  fuelUrban: string | null

  @Column({ field: 'fuel_combined', type: DataType.STRING })
  fuelCombined: string | null

  @Column({ field: 'drive_type', type: DataType.STRING })
  driveType: string | null

  @Column({ field: 'gearbox', type: DataType.STRING })
  gearbox: string | null

  @Column({ field: 'front_brakes', type: DataType.STRING })
  frontBrakes: string | null

  @Column({ field: 'rear_brakes', type: DataType.STRING })
  rearBrakes: string | null

  @Column({ field: 'tire_size', type: DataType.STRING })
  tireSize: string | null

  @Column({ field: 'length', type: DataType.STRING })
  length: string | null

  @Column({ field: 'width', type: DataType.STRING })
  width: string | null

  @Column({ field: 'height', type: DataType.STRING })
  height: string | null

  @Column({ field: 'wheelbase', type: DataType.STRING })
  wheelbase: string | null

  @Column({ field: 'cargo_volume', type: DataType.STRING })
  cargoVolume: string | null

  @Column({ field: 'ground_clearance', type: DataType.STRING })
  groundClearance: string | null

  @Column({ field: 'weight', type: DataType.STRING })
  weight: string | null

  @Column({ field: 'weight_limit', type: DataType.STRING })
  weightLimit: string | null

  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date
}

@Table({ timestamps: false, tableName: 'car_model' })
export class CarModelSqlModel extends CarModelDto {
  @BelongsTo(() => CarMakeSqlModel)
  make?: CarMakeSqlModel

  // @HasMany(() => CarRegistrationSqlModel)
  // carRegistrations!: CarRegistrationSqlModel[]
}
