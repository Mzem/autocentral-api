const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.environment' })

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

// function createTitle(car, model) {
//   let title = model

//   if (car.production_start_year) {
//     title += ` ${car.production_start_year}`
//   }
//   if (car.engine_name && car.engine_name !== '') {
//     title += ` ${car.engine_name}`
//   } else if (car.displacement) {
//     title += ` ${displacementToCylinder(car.displacement)}`
//   }
//   if (car.hp && car.hp !== 0) {
//     title += ` ${car.hp}`
//   }
//   if (car.torque && car.torque !== 0) {
//     title += ` ${car.torque}`
//   }

//   return title.trim().toUpperCase().replace(/\s+/g, ' ')
// }

sequelize.transaction(async transaction => {
  const updateDate = new Date().toISOString()
  for (const car of cars) {
    console.log('processing ' + car.title)
    let make_id = car.make_id
    let model = car.model

    if (car.make_id === 'mercedes-amg') {
      make_id = 'mercedes'
      if (!model.toUpperCase().includes('AMG')) {
        model += ' AMG'
      }
    } else if (car.make_id === 'mercedes-benz') {
      make_id = 'mercedes'
    }

    await sequelize.query(
      `INSERT INTO car_model 
      (id, make_id, model, from_year, to_year, production_years, model_start_year, model_end_year, engine_name, engine_detail, engine_type, displacement, cylinder, body, fuel, hp, hp_detail, torque, torque_detail, electric_hp, acceleration, top_speed, fuel_system, fuel_capacity, fuel_highway, fuel_urban, fuel_combined, drive_type, gearbox, front_brakes, rear_brakes, tire_size, length, width, height, wheelbase, cargo_volume, ground_clearance, weight, weight_limit, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          car.uuid,
          make_id,
          car.model,
          car.production_start_year || null,
          car.production_end_year || null,
          car.production_years || null,
          car.model_start_year || null,
          car.model_end_year || null,
          car.engine_name || null,
          car.engine_detail || null,
          car.engine_type || null,
          car.displacement || null,
          car.displacement ? displacementToCylinder(car.displacement) : null,
          car.body || null,
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
          car.drive_type || null,
          car.gearbox || null,
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
