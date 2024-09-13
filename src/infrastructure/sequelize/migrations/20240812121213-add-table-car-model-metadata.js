module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'car_model_metadata',
          {
            car_model_id: {
              primaryKey: true,
              type: Sequelize.STRING(48),
              allowNull: false,
              references: {
                model: 'car_model',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            info_url: {
              type: Sequelize.STRING,
              allowNull: true
            },
            image_urls: {
              type: Sequelize.TEXT,
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
        await queryInterface.dropTable('car_model_metadata', { transaction })
      }
    )
  }
}
