'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Function to map SQL data types to Sequelize data types
    function mapTypeToSequelize(type) {
      const varcharMatch = type.match(/character varying\((\d+)\)/i)
      const varcharSimple = type.match(/character varying/i)
      const integerArrayMatch = type.match(/integer\[\]/i)
      const integerMatch = type.match(/integer/i)
      const timestampTZMatch = type.match(/timestamp with time zone/i)

      if (varcharMatch) {
        // Handle VARCHAR with specific length
        const length = parseInt(varcharMatch[1], 10)
        return Sequelize.STRING(length)
      } else if (varcharSimple) {
        // Handle VARCHAR without specific length
        return Sequelize.STRING
      } else if (integerArrayMatch) {
        // Handle INTEGER[]
        return Sequelize.ARRAY(Sequelize.INTEGER)
      } else if (integerMatch) {
        // Handle INTEGER
        return Sequelize.INTEGER
      } else if (timestampTZMatch) {
        // Handle TIMESTAMP WITH TIME ZONE
        return Sequelize.DATE
      }
      // Add more type mappings as needed
      switch (type.toLowerCase()) {
        case 'bigint':
          return Sequelize.BIGINT
        case 'text':
          return Sequelize.TEXT
        case 'boolean':
          return Sequelize.BOOLEAN
        case 'date':
          return Sequelize.DATE
        case 'json':
          return Sequelize.JSON
        case 'array':
          return Sequelize.ARRAY(Sequelize.STRING) // Adjust array type if necessary
        // Add more cases as needed
        default:
          throw new Error(`Unhandled data type: ${type}`)
      }
    }

    // Get table structure
    const originalTableStructure = await queryInterface.describeTable(
      'car_post'
    )

    // Define columns with types mapped
    const newTableColumns = {}
    for (const [column, definition] of Object.entries(originalTableStructure)) {
      newTableColumns[column] = {
        type:
          column === 'phone_numbers'
            ? Sequelize.ARRAY(Sequelize.INTEGER)
            : mapTypeToSequelize(definition.type),
        allowNull: definition.allowNull,
        defaultValue: definition.defaultValue,
        primaryKey: definition.primaryKey,
        autoIncrement: definition.autoIncrement
      }
    }

    // Get foreign keys using a raw SQL query
    const [foreignKeys] = await queryInterface.sequelize.query(`
      SELECT
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name='car_post';
    `)

    // Add foreign key references to column definitions
    for (const foreignKey of foreignKeys) {
      const { column_name, foreign_table_name, foreign_column_name } =
        foreignKey
      if (newTableColumns[column_name]) {
        newTableColumns[column_name].references = {
          model: foreign_table_name,
          key: foreign_column_name
        }
      }
    }

    // Create the new table
    await queryInterface.createTable('car_post_cold', newTableColumns)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('car_post_cold')
  }
}
