const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.environment' })

const databaseUrl = process.env.DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
})

const makes = require('./car_makes.json')

sequelize.transaction(async transaction => {
  for (const make of makes) {
    await sequelize.query(
      `INSERT INTO car_make 
      (id, name, logo_url, info_url) 
      VALUES (?, ?, ?, ?)`,
      {
        replacements: [
          make.id,
          make.name,
          make.make_url ?? null,
          make.make_logo_url ?? null
        ],
        transaction
      }
    )
  }
})
