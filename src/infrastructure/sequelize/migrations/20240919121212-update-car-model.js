module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.changeColumn(
          'car_model',
          'to_year',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          { transaction }
        )
        await queryInterface.changeColumn(
          'car_model',
          'body',
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          { transaction }
        )
        await queryInterface.removeColumn('car_model', 'model_start_year', {
          transaction
        })
        await queryInterface.removeColumn('car_model', 'model_end_year', {
          transaction
        })
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.removeColumn(
          'car_model',
          'model_end_year',
          { type: Sequelize.STRING(7), allowNull: true },
          {
            transaction
          }
        )
        await queryInterface.removeColumn(
          'car_model',
          'model_start_year',
          { type: Sequelize.STRING(4), allowNull: true },
          {
            transaction
          }
        )
        await queryInterface.changeColumn(
          'car_model',
          'body',
          {
            type: Sequelize.ENUM(
              'Citadine',
              'Compacte',
              'Berline',
              'Monospace',
              'Coupé',
              'Convertible (Spyder, Cabriolet)',
              'Roadster',
              'Supercar',
              'Hypercar',
              'Limousine',
              'Break',
              'SUV',
              'Van',
              'Off-Roader',
              'Pick-up',
              'Utilitaire',
              'Berline (break, combi, touring)'
            ),
            allowNull: true
          },
          { transaction }
        )
        await queryInterface.changeColumn(
          'car_model',
          'to_year',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 2025
          },
          { transaction }
        )
      }
    )
  }
}
