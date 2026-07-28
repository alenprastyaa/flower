'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'category_group', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addIndex('products', ['category_group']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'category_group');
  },
};
