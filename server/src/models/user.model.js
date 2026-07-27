'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.CraftsmanProfile, { foreignKey: 'user_id', as: 'craftsmanProfile' });
      User.hasMany(models.OrderRequest, { foreignKey: 'buyer_user_id', as: 'buyerOrders' });
      User.hasMany(models.OrderStatusHistory, { foreignKey: 'changed_by_user_id', as: 'statusChanges' });
    }
  }

  User.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      role: { type: DataTypes.ENUM('superadmin', 'pengrajin', 'buyer'), allowNull: false },
      email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      full_name: { type: DataTypes.STRING(150), allowNull: false },
      phone: { type: DataTypes.STRING(30), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
    }
  );

  return User;
};
