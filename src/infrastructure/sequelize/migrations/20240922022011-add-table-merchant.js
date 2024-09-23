module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'merchant',
          {
            id: {
              primaryKey: true,
              type: Sequelize.STRING,
              allowNull: false
            },
            name: {
              type: Sequelize.STRING,
              allowNull: false
            },
            description: {
              type: Sequelize.TEXT,
              allowNull: true
            },
            avatar: {
              type: Sequelize.STRING,
              allowNull: true
            },
            is_shop: {
              type: Sequelize.BOOLEAN,
              allowNull: false
            },
            categories: {
              type: Sequelize.ARRAY(Sequelize.STRING),
              allowNull: false
            },
            phone_numbers: {
              type: Sequelize.ARRAY(Sequelize.INTEGER),
              allowNull: true
            },
            insta_id: {
              type: Sequelize.STRING,
              allowNull: true
            },
            fb_id: {
              type: Sequelize.STRING,
              allowNull: true
            },
            website: {
              type: Sequelize.STRING,
              allowNull: true
            },
            address: {
              type: Sequelize.STRING,
              allowNull: true
            },
            gmaps_link: {
              type: Sequelize.STRING,
              allowNull: true
            },
            region_id: {
              type: Sequelize.STRING,
              allowNull: true,
              references: {
                model: 'region',
                key: 'id'
              }
            },
            region_detail: {
              type: Sequelize.STRING,
              allowNull: true
            },
            id_tayara: {
              type: Sequelize.STRING,
              allowNull: true
            },
            id_automobiletn: {
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
        await queryInterface.dropTable('merchant', { transaction })
      }
    )
  }
}
