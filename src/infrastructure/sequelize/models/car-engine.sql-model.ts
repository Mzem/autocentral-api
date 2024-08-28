import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { Fuel } from '../../../domain/car-model'
import { CarMakeSqlModel } from './car-make.sql-model'
import { CarModelSqlModel } from './car-model.sql-model'
import { CarEngineModelAssociationSqlModel } from './car-engine-model-association.sql-model'

export class CarEngineDto extends Model {
  @PrimaryKey
  @Column({ field: 'id' })
  id: string

  @ForeignKey(() => CarMakeSqlModel)
  @Column({ field: 'make_id', type: DataType.STRING })
  makeId: string

  @Column({ field: 'model', type: DataType.STRING })
  model: string

  @Column({ field: 'type', type: DataType.STRING })
  type: string | null

  @Column({ field: 'from_year', type: DataType.STRING })
  fromYear: string | null

  @Column({ field: 'to_year', type: DataType.STRING })
  toYear: string | null

  @Column({ field: 'engine_name', type: DataType.STRING })
  engineName: string | null

  @Column({ field: 'cylinder', type: DataType.STRING })
  cylinder: string | null

  @Column({ field: 'fuel', type: DataType.STRING })
  fuel: Fuel | null

  @Column({ field: 'hp', type: DataType.INTEGER })
  hp: number | null

  @Column({ field: 'hp_remap', type: DataType.INTEGER })
  hpRemap: number | null

  @Column({ field: 'torque', type: DataType.INTEGER })
  torque: number | null

  @Column({ field: 'torque_remap', type: DataType.INTEGER })
  torqueRemap: number | null

  @Column({ field: 'url_source', type: DataType.STRING })
  urlSource: string | null

  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date
}

@Table({ timestamps: false, tableName: 'car_engine' })
export class CarEngineSqlModel extends CarEngineDto {
  @BelongsTo(() => CarMakeSqlModel)
  make?: CarMakeSqlModel

  @BelongsToMany(
    () => CarModelSqlModel,
    () => CarEngineModelAssociationSqlModel
  )
  models: CarModelSqlModel[]

  // @HasMany(() => CarRegistrationSqlModel)
  // carRegistrations!: CarRegistrationSqlModel[]
}
