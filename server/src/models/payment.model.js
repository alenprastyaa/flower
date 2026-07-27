'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.OrderRequest, { foreignKey: 'order_request_id', as: 'orderRequest' });
      Payment.belongsTo(models.User, { foreignKey: 'marked_by_admin_id', as: 'markedByAdmin' });
    }
  }

  Payment.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      currency: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'IDR' },
      status: {
        type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      method: {
        type: DataTypes.ENUM('manual', 'gateway'),
        allowNull: false,
        defaultValue: 'manual',
      },
      gateway_provider: { type: DataTypes.STRING(50), allowNull: true },
      gateway_reference_id: { type: DataTypes.STRING(191), allowNull: true },
      paid_at: { type: DataTypes.DATE, allowNull: true },
      marked_by_admin_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      underscored: true,
    }
  );

  return Payment;
};
