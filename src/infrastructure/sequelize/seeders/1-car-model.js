'use strict'

const data = [{ id: 'uid' }]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.bulkInsert('car_model', data, {
          transaction
        })
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.bulkDelete('car_model', null, {
          transaction,
          cascade: true
        })
      }
    )
  }
}
