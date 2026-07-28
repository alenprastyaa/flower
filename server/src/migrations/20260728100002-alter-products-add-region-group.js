'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'region_group_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'region_groups', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('products', ['region_group_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'region_group_id');
  },
};
