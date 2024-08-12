module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'car_registration',
          {
            id: {
              primaryKey: true,
              type: Sequelize.STRING,
              allowNull: false
            },
            make: {
              type: Sequelize.STRING,
              allowNull: true
            },
            model: {
              type: Sequelize.STRING,
              allowNull: true
            },
            variant: {
              type: Sequelize.STRING,
              allowNull: true
            },
            registration: {
              type: Sequelize.STRING,
              allowNull: true,
              unique: true
            },
            registrationDate: {
              field: 'registration_date',
              type: Sequelize.STRING,
              allowNull: true
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
        await queryInterface.dropTable('car_registration', { transaction })
      }
    )
  }
}
