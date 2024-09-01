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
            // E class W213 E200
            model: {
              type: Sequelize.STRING(100),
              allowNull: false
            },
            // 2016
            from_year: {
              type: Sequelize.STRING(4),
              allowNull: false
            },
            // 2020
            to_year: {
              type: Sequelize.STRING(7),
              allowNull: false
            },
            // 2016, 2017, 2018, 2019, 2020
            production_years: {
              type: Sequelize.STRING,
              allowNull: true
            },
            model_start_year: {
              type: Sequelize.STRING(4),
              allowNull: true
            },
            model_end_year: {
              type: Sequelize.STRING(7),
              allowNull: true
            },
            engine_name: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            engine_detail: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            // L4 (most common)
            engine_type: {
              type: Sequelize.ENUM(
                'V2',
                'L2',
                'Flat-2',
                'L3',
                'L4',
                'Flat-4', // Also known as Boxer-4
                'V4', // Rare, but exists
                'L5',
                'V6',
                'L6',
                'Flat-6', // Also known as Boxer-6
                'L8',
                'V8',
                'V10',
                'V12',
                'Flat-12', // Testarossa only
                'W12',
                'W16',
                'Permanently excited synchronous motor (PSM)',
                'Rotary', // Used in some Mazda engines
                'Electric'
              ),
              allowNull: true
            },
            displacement: {
              type: Sequelize.STRING(4),
              allowNull: true
            },
            cylinder: {
              type: Sequelize.STRING(3),
              allowNull: true
            },
            body: {
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
            hp_detail: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            // 300
            torque: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            torque_detail: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            electric_hp: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            // 8.1
            acceleration: {
              type: Sequelize.DOUBLE,
              allowNull: true
            },
            top_speed: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            fuel_system: {
              type: Sequelize.STRING,
              allowNull: true
            },
            fuel_capacity: {
              type: Sequelize.STRING(30),
              allowNull: true
            },
            fuel_highway: {
              type: Sequelize.STRING(30),
              allowNull: true
            },
            fuel_urban: {
              type: Sequelize.STRING(30),
              allowNull: true
            },
            fuel_combined: {
              type: Sequelize.STRING(30),
              allowNull: true
            },
            drive_type: {
              type: Sequelize.STRING(10),
              allowNull: true
            },
            gearbox: {
              type: Sequelize.STRING,
              allowNull: true
            },
            front_brakes: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            rear_brakes: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            tire_size: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            length: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            width: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            height: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            wheelbase: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            cargo_volume: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            ground_clearance: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            weight: {
              type: Sequelize.STRING(100),
              allowNull: true
            },
            weight_limit: {
              type: Sequelize.STRING(100),
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
        await queryInterface.dropTable('car_model', { transaction })
      }
    )
  }
}
