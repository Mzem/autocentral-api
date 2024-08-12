module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'car_model',
          {
            id: {
              primaryKey: true,
              type: Sequelize.STRING,
              allowNull: false
            },
            make: {
              type: Sequelize.STRING,
              allowNull: false
            },
            model: {
              type: Sequelize.STRING,
              allowNull: false
            },
            type: {
              type: Sequelize.STRING,
              allowNull: false
            },
            yearReleased: {
              type: Sequelize.STRING,
              allowNull: false
            },
            // not Null, put "..." when the car is not discontinued so it differs from Null
            yearDiscontinued: {
              field: 'registration_date',
              type: Sequelize.STRING,
              allowNull: false
            },
            type: {
              type: Sequelize.STRING,
              allowNull: true
            },
            fuel: {
              type: Sequelize.STRING,
              allowNull: true
            },
            fiscalHP: {
              field: 'fiscal_hp',
              type: Sequelize.STRING,
              allowNull: true
            },
            cylinder: {
              type: Sequelize.STRING,
              allowNull: true
            },
            vin: {
              type: Sequelize.STRING,
              allowNull: true
            },
            engine: {
              type: Sequelize.STRING,
              allowNull: true
            },
            transmission: {
              type: Sequelize.STRING,
              allowNull: true
            },
            gearboxCode: {
              field: 'gearbox_code',
              type: Sequelize.STRING,
              allowNull: true
            },
            constructorType: {
              field: 'constructor_type',
              type: Sequelize.STRING,
              allowNull: true
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
        await queryInterface.dropTable('car_model', { transaction })
      }
    )
  }
}
