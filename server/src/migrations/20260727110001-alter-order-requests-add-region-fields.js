'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_requests', 'delivery_province', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('order_requests', 'delivery_district', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('order_requests', 'delivery_village', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('order_requests', 'delivery_village');
    await queryInterface.removeColumn('order_requests', 'delivery_district');
    await queryInterface.removeColumn('order_requests', 'delivery_province');
  },
};
