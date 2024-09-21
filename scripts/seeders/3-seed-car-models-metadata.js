const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.environment' })

const databaseUrl = process.env.DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
})

const cars = require('./car_models_metadata.json')

sequelize.transaction(async transaction => {
  for (const car of cars) {
    // First, check if the car_model_id exists
    const isValidId = await sequelize.query(
      `SELECT * FROM car_model WHERE id = ?`,
      {
        replacements: [car.uuid],
        transaction,
        type: sequelize.QueryTypes.SELECT
      }
    )

    if (isValidId.length > 0) {
      // Perform the insert if the ID is valid
      await sequelize.query(
        `INSERT INTO car_model_metadata 
        (car_model_id, info_url, image_urls) 
        VALUES (?, ?, ?)`,
        {
          replacements: [
            car.uuid,
            car.info_url ?? null,
            car.image_urls ?? null
          ],
          transaction
        }
      )
    }
  }
})
