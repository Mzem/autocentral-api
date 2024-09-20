module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.changeColumn(
          'car_engine',
          'fuel',
          {
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
            allowNull: false
          },
          { transaction }
        )
        await queryInterface.removeColumn('car_engine', 'hp_remap', {
          transaction
        })
        await queryInterface.addColumn(
          'car_engine',
          'hp_stage1',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_engine',
          'hp_stage2',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.removeColumn('car_engine', 'torque_remap', {
          transaction
        })
        await queryInterface.addColumn(
          'car_engine',
          'torque_stage1',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_engine',
          'torque_stage2',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.removeColumn('car_engine', 'url_source', {
          transaction
        })
        await queryInterface.addColumn(
          'car_engine',
          'url_source_brperf',
          {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_engine',
          'url_source_shiftech',
          {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_engine',
          'image_url',
          {
            type: Sequelize.STRING,
            allowNull: true
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
        await queryInterface.removeColumn('car_engine', 'image_url', {
          transaction
        })
        await queryInterface.removeColumn('car_engine', 'url_source_shiftech', {
          transaction
        })
        await queryInterface.removeColumn('car_engine', 'url_source_brperf', {
          transaction
        })
        await queryInterface.addColumn(
          'car_engine',
          'url_source',
          {
            type: Sequelize.TEXT,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.removeColumn('car_engine', 'torque_stage2', {
          transaction
        })
        await queryInterface.removeColumn('car_engine', 'torque_stage1', {
          transaction
        })
        await queryInterface.addColumn(
          'car_engine',
          'torque_remap',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.removeColumn('car_engine', 'hp_stage2', {
          transaction
        })
        await queryInterface.removeColumn('car_engine', 'hp_stage1', {
          transaction
        })
        await queryInterface.addColumn(
          'car_engine',
          'hp_remap',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.changeColumn(
          'car_engine',
          'fuel',
          {
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
          { transaction }
        )
      }
    )
  }
}
