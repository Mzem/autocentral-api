module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'car_engine_model_association',
          {
            car_engine_id: {
              primaryKey: true,
              type: Sequelize.STRING(48),
              allowNull: false,
              references: {
                model: 'car_engine',
                key: 'id'
              }
            },
            car_model_id: {
              primaryKey: true,
              type: Sequelize.STRING(48),
              allowNull: false,
              references: {
                model: 'car_model',
                key: 'id'
              }
            }
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
        await queryInterface.dropTable('car_engine_model_association', {
          transaction
        })
      }
    )
  }
}
