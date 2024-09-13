module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.addColumn(
          'car_registration',
          'creation_date',
          {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('now')
          },
          { transaction }
        )
        await queryInterface.addColumn(
          'car_registration',
          'update_date',
          {
            type: Sequelize.DATE,
            allowNull: true
          },
          { transaction }
        )
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.removeColumn('car_registration', 'update_date', {
          transaction
        })
        await queryInterface.removeColumn('car_registration', 'creation_date', {
          transaction
        })
      }
    )
  }
}
