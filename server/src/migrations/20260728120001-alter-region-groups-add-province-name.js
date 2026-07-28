'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('region_groups', 'province_name', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('region_groups', 'province_name');
  },
};
