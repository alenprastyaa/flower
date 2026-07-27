'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_requests', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      buyer_user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      buyer_name: { type: Sequelize.STRING(150), allowNull: false },
      buyer_phone: { type: Sequelize.STRING(30), allowNull: false },
      buyer_email: { type: Sequelize.STRING(191), allowNull: true },
      tracking_token: { type: Sequelize.CHAR(36), allowNull: false, unique: true },
      arrangement_type: { type: Sequelize.STRING(100), allowNull: true },
      occasion: { type: Sequelize.STRING(150), allowNull: true },
      needed_by_date: { type: Sequelize.DATEONLY, allowNull: false },
      budget_min: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      budget_max: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      reference_image_urls: { type: Sequelize.JSON, allowNull: true },
      delivery_address: { type: Sequelize.TEXT, allowNull: false },
      delivery_city: { type: Sequelize.STRING(100), allowNull: true },
      status: {
        type: Sequelize.ENUM(
          'submitted',
          'rejected',
          'approved',
          'published',
          'claimed',
          'in_progress',
          'completed',
          'cancelled',
          'expired'
        ),
        allowNull: false,
        defaultValue: 'submitted',
      },
      admin_notes: { type: Sequelize.TEXT, allowNull: true },
      final_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      claimed_by_craftsman_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'craftsman_profiles', key: 'id' },
        onDelete: 'SET NULL',
      },
      claimed_at: { type: Sequelize.DATE, allowNull: true },
      reviewed_by_admin_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      commission_rate_applied: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      commission_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      craftsman_earning: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      lock_version: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('order_requests', ['status']);
    await queryInterface.addIndex('order_requests', ['claimed_by_craftsman_id']);
    await queryInterface.addIndex('order_requests', ['needed_by_date']);
    await queryInterface.addIndex('order_requests', ['status', 'needed_by_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_requests');
  },
};
