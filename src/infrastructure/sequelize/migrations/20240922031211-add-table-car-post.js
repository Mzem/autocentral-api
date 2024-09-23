module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'car_post',
          {
            id: {
              primaryKey: true,
              type: Sequelize.STRING,
              allowNull: false
            },
            source: {
              type: Sequelize.STRING,
              allowNull: false
            },
            id_source: {
              type: Sequelize.STRING,
              allowNull: false
            },
            url_source: {
              type: Sequelize.STRING,
              allowNull: false
            },
            merchant_id: {
              type: Sequelize.STRING,
              allowNull: false,
              references: {
                model: 'merchant',
                key: 'id'
              }
            },
            published_at: {
              type: Sequelize.DATE,
              allowNull: false
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: true
            },
            region_id: {
              type: Sequelize.STRING,
              allowNull: false,
              references: {
                model: 'region',
                key: 'id'
              }
            },
            region_detail: {
              type: Sequelize.STRING,
              allowNull: true
            },
            phone_numbers: {
              type: Sequelize.ARRAY(Sequelize.INTEGER),
              allowNull: true
            },
            title: {
              type: Sequelize.STRING,
              allowNull: true
            },
            description: {
              type: Sequelize.TEXT,
              allowNull: true
            },
            images: {
              type: Sequelize.ARRAY(Sequelize.STRING),
              allowNull: true
            },
            price: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            car_engine_id: {
              type: Sequelize.STRING,
              allowNull: true,
              references: {
                model: 'car_engine',
                key: 'id'
              }
            },
            make: {
              type: Sequelize.STRING,
              allowNull: true
            },
            model: {
              type: Sequelize.STRING,
              allowNull: true
            },
            body: {
              type: Sequelize.STRING,
              allowNull: true
            },
            year: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            km: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            fuel: {
              type: Sequelize.STRING,
              allowNull: true
            },
            cv: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            engine: {
              type: Sequelize.STRING,
              allowNull: true
            },
            cylinder: {
              type: Sequelize.STRING,
              allowNull: true
            },
            color: {
              type: Sequelize.STRING,
              allowNull: true
            },
            gearbox: {
              type: Sequelize.STRING,
              allowNull: true
            },
            interior_type: {
              type: Sequelize.STRING,
              allowNull: true
            },
            interior_color: {
              type: Sequelize.STRING,
              allowNull: true
            },
            transmission: {
              type: Sequelize.STRING,
              allowNull: true
            },
            car_play: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            bluetooth: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            sunroof: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            alarm: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            ac_auto: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            led_lights: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            led_interior: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            keyless: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            alu_rims: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            warranty: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            exchange: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            leasing: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            camera: {
              type: Sequelize.BOOLEAN,
              allowNull: true
            },
            first_owner: {
              type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable('car_post', { transaction })
      }
    )
  }
}
