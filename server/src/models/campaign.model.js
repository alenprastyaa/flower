'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Campaign extends Model {
    static associate(models) {
      Campaign.belongsTo(models.OrderRequest, { foreignKey: 'order_request_id', as: 'orderRequest' });
      Campaign.belongsTo(models.CraftsmanProfile, { foreignKey: 'claimed_by_craftsman_id', as: 'claimedBy' });
    }
  }

  Campaign.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      public_summary: { type: DataTypes.TEXT, allowNull: false },
      city: { type: DataTypes.STRING(100), allowNull: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      needed_by_date: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM('open', 'claimed', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
      },
      claimed_by_craftsman_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      published_at: { type: DataTypes.DATE, allowNull: false },
      claimed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Campaign',
      tableName: 'campaigns',
      underscored: true,
    }
  );

  return Campaign;
};
