'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CommissionConfig extends Model {
    static associate(models) {
      CommissionConfig.belongsTo(models.User, { foreignKey: 'created_by_user_id', as: 'createdByUser' });
    }
  }

  CommissionConfig.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      rate_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      effective_from: { type: DataTypes.DATE, allowNull: false },
      created_by_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      sequelize,
      modelName: 'CommissionConfig',
      tableName: 'commission_configs',
      underscored: true,
    }
  );

  return CommissionConfig;
};
