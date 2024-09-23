import { CarEngineModelAssociationSqlModel } from './car-engine-model-association.sql-model'
import { CarEngineSqlModel } from './car-engine.sql-model'
import { CarMakeSqlModel } from './car-make.sql-model'
import { CarModelSqlModel } from './car-model.sql-model'
import { CarPostSqlModel } from './car-post.sql-model'
import { CarRegistrationSqlModel } from './car-registration.sql-model'
import { MerchantSqlModel } from './merchant.sql-model'
import { RegionSqlModel } from './region.sql-model'

export const sqlModels = [
  CarMakeSqlModel,
  CarEngineSqlModel,
  CarModelSqlModel,
  CarRegistrationSqlModel,
  CarEngineModelAssociationSqlModel,
  RegionSqlModel,
  MerchantSqlModel,
  CarPostSqlModel
]
