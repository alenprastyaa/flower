'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'visitor_id', {
      type: Sequelize.STRING(64),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('conversations', 'visitor_name', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('conversations', 'visitor_name');
    await queryInterface.removeColumn('conversations', 'visitor_id');
  },
};
