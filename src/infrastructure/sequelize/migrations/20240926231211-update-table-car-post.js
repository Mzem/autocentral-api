module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.addColumn(
          'car_post',
          'is_expired',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          {
            transaction
          }
        )
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.removeColumn('car_post', 'is_expired', {
          transaction
        })
      }
    )
  }
}
