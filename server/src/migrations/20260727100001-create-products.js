'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      subtitle: { type: Sequelize.STRING(255), allowNull: true },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('products', ['is_active', 'sort_order']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
