const { Sequelize, QueryTypes } = require('sequelize')
require('dotenv').config({ path: '../../.environment' })
function cleanString(string) {
  return string?.toString().replace(/\s+/g, ' ').trim()
}

const databaseUrl = process.env.DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
})

const cars = require('./car_models.json')

function calculateHighwayConsumption(urbanConsumption, combinedConsumption) {
  if (!urbanConsumption || !combinedConsumption) {
    return null
  }
  const highwayConsumption =
    (Number(combinedConsumption.replace(' L/100Km', '')) -
      0.37 * Number(urbanConsumption.replace(' L/100Km', ''))) /
    0.63
  return `${Math.ceil(highwayConsumption * 10) / 10} L/100Km`
}

function extractCylinder(inputString) {
  const match = inputString?.toString().match(/\d\.\d/)
  return match ? match[0] : null
}

function displacementToCylinder(displacement) {
  const nbDisp = Number(displacement)

  if (isNaN(nbDisp)) {
    throw new Error('Invalid displacement number format.')
  }

  if (displacement.length !== 4 && displacement.length !== 3) {
    throw new Error('Invalid displacement length format.')
  }

  const final = Math.round(nbDisp / 100)

  if (displacement >= 901) {
    return `${final.toString().charAt(0)}.${final.toString().charAt(1)}`
  } else {
    return `0.${final.toString().charAt(0)}`
  }
}

sequelize.transaction(async transaction => {
  await sequelize.query(
    `DELETE FROM car_model_metadata WHERE car_model_id is not null`,
    {
      transaction
    }
  )
  await sequelize.query(
    `DELETE FROM car_engine_model_association WHERE car_engine_id is not null`,
    {
      transaction
    }
  )
  await sequelize.query(`DELETE FROM car_model WHERE id is not null`, {
    transaction
  })
  const makeIds = (
    await sequelize.query(`SELECT * from car_make`, {
      type: QueryTypes.SELECT,
      transaction
    })
  ).map(makeSQL => makeSQL.id)
  const updateDate = new Date().toISOString()

  for (const car of cars) {
    console.log('processing ' + car.title)
    let make_id = car.make_id

    if (!makeIds.includes(make_id)) continue

    await sequelize.query(
      `INSERT INTO car_model 
      (id, make_id, model, from_year, to_year, engine_name, engine_detail, engine_type, displacement, cylinder, body, fuel, hp, hp_detail, torque, torque_detail, electric_hp, acceleration, top_speed, fuel_system, fuel_capacity, fuel_highway, fuel_urban, fuel_combined, drive_type, gearbox, front_brakes, rear_brakes, tire_size, length, width, height, wheelbase, cargo_volume, ground_clearance, weight, weight_limit, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          car.uuid,
          make_id,
          cleanString(car.model.replace('doors', 'portes')),
          car.production_start_year,
          isNaN(Number(car.production_end_year))
            ? null
            : Number(car.production_end_year),
          cleanString(
            car.engine_name
              ?.replace('AWD', '')
              .replace('FWD', '')
              .replace('RWD', '')
          ) || null,
          car.engine_detail || null,
          car.engine_type || null,
          car.displacement || null,
          car.displacement
            ? displacementToCylinder(car.displacement)
            : extractCylinder(car.engine_name),
          car.body
            ?.replace(' (Spyder, Cabriolet)', '')
            .replace(' (break, combi, touring)', '/Break') || null,
          car.fuel || null,
          car.hp || null,
          car.hp_detail || null,
          car.torque || null,
          car.torque_detail || null,
          car.fuel === 'Electrique' ? car.hp || null : null,
          car.acceleration || null,
          car.top_speed || null,
          car.fuel_system || null,
          car.fuel_capacity || null,
          calculateHighwayConsumption(car.city, car.combined),
          car.city || null,
          car.combined || null,
          car.drive_type
            ?.replace('RWD', 'Propulsion')
            .replace('AWD', 'Intégrale')
            .replace('FWD', 'Traction') || null,
          cleanString(renameGearbox(car.gearbox)) || null,
          car.front_brakes || null,
          car.rear_brakes || null,
          car.tire_size || null,
          car.length || null,
          car.width || null,
          car.height || null,
          car.wheelbase || null,
          car.cargo_volume || null,
          car.ground_clearance || null,
          car.weight || null,
          car.weight_limit || null,
          updateDate
        ],
        transaction
      }
    )
  }
})

function renameGearbox(gearbox) {
  return gearbox
    ?.replace('single gear', 'vitesse unique')
    .replace('Single gear', 'vitesse unique')
    .replace('Single speed', 'vitesse unique')
    .replace('Single Speed', 'vitesse unique')
    .replace('speed', 'vitesses')
    .replace('Speed', 'vitesses')
    .replace('-automatic', ' automatique')
    .replace('-Automatic', ' automatique')
    .replace('automatic', 'automatique')
    .replace('automayic', 'automatique')
    .replace('Automatic', 'automatique')
    .replace('-manual', ' manuelle')
    .replace('-Manual', ' manuelle')
    .replace('manual', 'manuelle')
    .replace('Manual', 'manuelle')
    .replace('six', '6')
    .replace('Six', '6')
    .replace('gearbox', '')
}
