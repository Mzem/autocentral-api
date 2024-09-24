module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.addColumn(
          'car_post',
          'hp',
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
          'is_featured',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          {
            transaction
          }
        )
        await queryInterface.changeColumn(
          'car_post',
          'id_source',
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction
          }
        )
        await queryInterface.changeColumn(
          'car_post',
          'url_source',
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
        await queryInterface.changeColumn(
          'car_post',
          'id_source',
          {
            type: Sequelize.STRING,
            allowNull: false
          },
          {
            transaction
          }
        )
        await queryInterface.changeColumn(
          'car_post',
          'url_source',
          {
            type: Sequelize.STRING,
            allowNull: false
          },
          {
            transaction
          }
        )
        await queryInterface.removeColumn('car_post', 'is_featured', {
          transaction
        })
        await queryInterface.removeColumn('car_post', 'hp', {
          transaction
        })
      }
    )
  }
}
