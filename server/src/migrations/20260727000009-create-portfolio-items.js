'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('portfolio_items', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      craftsman_profile_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'craftsman_profiles', key: 'id' },
        onDelete: 'CASCADE',
      },
      order_request_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'order_requests', key: 'id' },
        onDelete: 'SET NULL',
      },
      image_url: { type: Sequelize.STRING(500), allowNull: false },
      caption: { type: Sequelize.STRING(255), allowNull: true },
      is_featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('portfolio_items', ['craftsman_profile_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('portfolio_items');
  },
};
