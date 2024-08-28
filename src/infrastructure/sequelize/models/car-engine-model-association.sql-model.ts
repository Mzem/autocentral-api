import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { CarEngineSqlModel } from './car-engine.sql-model'
import { CarModelSqlModel } from './car-model.sql-model'

@Table({ timestamps: false, tableName: 'car_engine_model_association' })
export class CarEngineModelAssociationSqlModel extends Model {
  @PrimaryKey
  @ForeignKey(() => CarEngineSqlModel)
  @Column({ field: 'car_engine_id', type: DataType.STRING })
  carEngineId: string

  @ForeignKey(() => CarModelSqlModel)
  @Column({ field: 'car_model_id', type: DataType.STRING })
  carModelId: string
}
