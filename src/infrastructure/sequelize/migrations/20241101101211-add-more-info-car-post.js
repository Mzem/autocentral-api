module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.addColumn(
          'car_post',
          'fcr',
          {
            type: Sequelize.BOOLEAN,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_post',
          'variant',
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_post',
          'type',
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_post',
          'new_url',
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_post',
          'new_price',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_post',
          'estimated_price',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_post',
          'thumbnail',
          {
            type: Sequelize.STRING(500),
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.addColumn(
          'car_post',
          'options',
          {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.changeColumn(
          'merchant',
          'address',
          {
            type: Sequelize.STRING(1000),
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
        await queryInterface.removeColumn('car_post', 'fcr', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'variant', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'type', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'new_url', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'new_price', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'estimated_price', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'thumbnail', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'options', {
          transaction
        })
      }
    )
  }
}
