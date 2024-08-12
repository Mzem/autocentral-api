'use strict'

const data = [{ id: 'uid' }]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.bulkInsert('car_registration_tn', data, {
          transaction
        })
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.bulkDelete('car_registration_tn', null, {
          transaction,
          cascade: true
        })
      }
    )
  }
}
