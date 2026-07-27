'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.ENUM('buyer_support', 'group'), allowNull: false },
      order_request_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        unique: true,
        references: { model: 'order_requests', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('conversations', ['type', 'updated_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('conversations');
  },
};
