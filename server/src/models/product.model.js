'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.OrderRequest, { foreignKey: 'product_id', as: 'orders' });
    }
  }

  Product.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      subtitle: { type: DataTypes.STRING(255), allowNull: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      category: { type: DataTypes.STRING(100), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      underscored: true,
    }
  );

  return Product;
};
