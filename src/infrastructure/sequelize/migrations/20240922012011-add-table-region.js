module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.SERIALIZABLE },
      async transaction => {
        await queryInterface.createTable(
          'region',
          {
            id: {
              primaryKey: true,
              type: Sequelize.STRING,
              allowNull: false
            },
            name: {
              type: Sequelize.STRING(20),
              allowNull: false
            }
          },
          { transaction }
        )

        const regions = require('./regions.json')

        for (const region of regions) {
          await queryInterface.sequelize.query(
            `INSERT INTO region 
            (id, name) 
            VALUES (:id, :name)`,
            {
              replacements: {
                id: region.name
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
                  .replace(/[^\w\s]/g, '')
                  .replace(/\s+/g, ' ') // Remove multiple whitespaces
                  .toLowerCase()
                  .trim()
                  .replace(/ /g, '-'),
                name: region.name
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
        await queryInterface.dropTable('region', { transaction })
      }
    )
  }
}
