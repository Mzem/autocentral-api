const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.environment' })
const databaseUrl = process.env.DATABASE_URL
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
})
const makes = require('../../src/infrastructure/sequelize/migrations/car_makes.json')
sequelize.transaction(async transaction => {
  for (const make of makes) {
    await sequelize.query(
      `INSERT INTO car_make 
      (id, name, category, remap) 
      VALUES (:id, :name, :category, :remap) ON CONFLICT (id) DO UPDATE SET category = :category, remap = :remap`,
      {
        replacements: {
          id: make.id,
          name: make.name,
          category: make.category ?? null,
          remap: make.remap === undefined ? true : make.remap
        },
        transaction
      }
    )
  }
})
