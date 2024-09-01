module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'car_engine',
          {
            id: {
              primaryKey: true,
              type: Sequelize.STRING(48),
              allowNull: false
            },
            // mercedes
            make_id: {
              type: Sequelize.STRING(100),
              allowNull: false,
              references: {
                model: 'car_make',
                key: 'id'
              }
            },
            model: {
              type: Sequelize.STRING(100),
              allowNull: false
            },
            type: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            // 2016
            from_year: {
              type: Sequelize.STRING(7),
              allowNull: false
            },
            // 2020
            to_year: {
              type: Sequelize.STRING(7),
              allowNull: false
            },
            engine_name: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            cylinder: {
              type: Sequelize.STRING(3),
              allowNull: true
            },
            fuel: {
              type: Sequelize.ENUM(
                'Essence',
                'Ethanol',
                'Diesel',
                'Gaz',
                'Hydrogen',
                'Hybrid',
                'Plug-in Hybrid',
                'Essence Hybrid',
                'Essence Micro Hybrid',
                'Diesel Hybrid',
                'Diesel Micro Hybrid',
                'Electrique'
              ),
              allowNull: true
            },
            hp: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            hp_remap: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            torque: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            torque_remap: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            url_source: {
              type: Sequelize.TEXT,
              allowNull: true
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false
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
        await queryInterface.dropTable('car_engine', { transaction })
      }
    )
  }
}
