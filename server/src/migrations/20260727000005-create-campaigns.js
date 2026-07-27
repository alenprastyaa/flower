'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_request_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'order_requests', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      public_summary: { type: Sequelize.TEXT, allowNull: false },
      city: { type: Sequelize.STRING(100), allowNull: true },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      needed_by_date: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('open', 'claimed', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
      },
      claimed_by_craftsman_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'craftsman_profiles', key: 'id' },
        onDelete: 'SET NULL',
      },
      published_at: { type: Sequelize.DATE, allowNull: false },
      claimed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('campaigns', ['status', 'published_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaigns');
  },
};
