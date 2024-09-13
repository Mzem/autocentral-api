module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'car_make',
          {
            id: {
              primaryKey: true,
              type: Sequelize.STRING(20),
              allowNull: false
            },
            name: {
              type: Sequelize.STRING(20),
              allowNull: false
            },
            category: {
              type: Sequelize.STRING(20),
              allowNull: true
            },
            remap: {
              type: Sequelize.BOOLEAN,
              allowNull: false
            }
          },
          { transaction }
        )

        const makes = require('./car_makes.json')

        for (const make of makes) {
          await queryInterface.sequelize.query(
            `INSERT INTO car_make 
            (id, name, category, remap) 
            VALUES (:id, :name, :category, :remap) ON CONFLICT (id) DO UPDATE SET category = :category, remap = :remap`,
            {
              replacements: {
                id: make.id,
                name: make.name,
                category: make.category ?? null,
                remap: make.remap === undefined ? true : make.remap
              },
              transaction
            }
          )
        }
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.dropTable('car_make', { transaction })
      }
    )
  }
}
