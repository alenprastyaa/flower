'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_requests', 'product_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'products', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('order_requests', 'product_image_snapshot', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addIndex('order_requests', ['product_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('order_requests', 'product_image_snapshot');
    await queryInterface.removeColumn('order_requests', 'product_id');
  },
};
