'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_request_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'order_requests', key: 'id' },
        onDelete: 'CASCADE',
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      currency: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'IDR' },
      status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'refunded'),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      method: {
        type: Sequelize.ENUM('manual', 'gateway'),
        allowNull: false,
        defaultValue: 'manual',
      },
      gateway_provider: { type: Sequelize.STRING(50), allowNull: true },
      gateway_reference_id: { type: Sequelize.STRING(191), allowNull: true },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      marked_by_admin_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('payments', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
