const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.environment' })

const databaseUrl = process.env.DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
})

const cars = require('./car_models_metadata.json')

sequelize.transaction(async transaction => {
  for (const car of cars) {
    await sequelize.query(
      `INSERT INTO car_model_metadata 
      (car_model_id, info_url, image_urls) 
      VALUES (?, ?, ?)`,
      {
        replacements: [car.uuid, car.info_url ?? null, car.image_urls ?? null],
        transaction
      }
    )
  }
})
