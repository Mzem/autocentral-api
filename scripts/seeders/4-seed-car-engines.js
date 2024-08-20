const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.environment' })
const uuid = require('uuid')

const databaseUrl = process.env.DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
})

const cars = require('./car_engines_180824.json')

function extractCylinder(inputString) {
  const match = inputString.toString().match(/\d\.\d/)
  return match ? match[0] : null
}

sequelize.transaction(async transaction => {
  const updateDate = new Date().toISOString()

  for (const car of cars) {
    // Remap car so it can be mapped
    const mappedCar = {
      id: uuid.v4(),
      make: car.make
        .replace('Citroën', 'Citroen')
        .replace('DS', 'DS-Automobiles')
        .replace('Landrover', 'Land Rover'),
      make_id: car.make
        .replace('Citroën', 'Citroen')
        .replace('DS', 'DS-Automobiles')
        .replace('Landrover', 'Land Rover')
        .replace('SsangYong', 'Ssang-Yong')
        .toLowerCase()
        .trim()
        .replace(/ /g, '-'),
      model: car.model,
      type: car.type,
      from_year: car.production_start_year.toLowerCase(),
      to_year: car.production_end_year.toLowerCase(),
      engine_name: car.engine_name,
      cylinder: extractCylinder(car.engine_name),
      fuel: car.fuel,
      hp: Number(
        car.hp
          .replace('ch', '')
          .replace('Ch', '')
          .replace('CH', '')
          .replace('cH', '')
          .trim()
      ),
      hp_remap: Number(
        car.hp_remap
          .replace('ch', '')
          .replace('Ch', '')
          .replace('CH', '')
          .replace('cH', '')
          .trim()
      ),
      torque: Number(
        car.torque
          .replace('Nm', '')
          .replace('NM', '')
          .replace('nm', '')
          .replace('nM', '')
          .trim()
      ),
      torque_remap: Number(
        car.torque_remap
          .replace('Nm', '')
          .replace('NM', '')
          .replace('nm', '')
          .replace('nM', '')
          .trim()
      ),
      url_source: car.URL_SOURCE,
      updated_at: updateDate
    }

    await sequelize.query(
      `INSERT INTO car_make (id, name) VALUES ('${mappedCar.make_id}', '${mappedCar.make}') ON CONFLICT (id) DO NOTHING`,
      {
        transaction
      }
    )

    // console.log('inserting %j', mappedCar)
    await sequelize.query(
      `INSERT INTO car_engine (id, make_id, model, type, from_year, to_year, engine_name, cylinder, fuel, hp, hp_remap, torque, torque_remap, url_source, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          mappedCar.id,
          mappedCar.make_id,
          mappedCar.model,
          mappedCar.type || null,
          mappedCar.from_year,
          mappedCar.to_year,
          mappedCar.engine_name,
          mappedCar.cylinder,
          mappedCar.fuel,
          mappedCar.hp,
          mappedCar.hp_remap,
          mappedCar.torque,
          mappedCar.torque_remap,
          mappedCar.url_source,
          mappedCar.updated_at
        ],
        transaction
      }
    )
  }
})
