'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderStatusHistory extends Model {
    static associate(models) {
      OrderStatusHistory.belongsTo(models.OrderRequest, { foreignKey: 'order_request_id', as: 'orderRequest' });
      OrderStatusHistory.belongsTo(models.User, { foreignKey: 'changed_by_user_id', as: 'changedByUser' });
    }
  }

  OrderStatusHistory.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      from_status: { type: DataTypes.STRING(30), allowNull: true },
      to_status: { type: DataTypes.STRING(30), allowNull: false },
      changed_by_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      note: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      sequelize,
      modelName: 'OrderStatusHistory',
      tableName: 'order_status_history',
      underscored: true,
      updatedAt: false,
    }
  );

  return OrderStatusHistory;
};
