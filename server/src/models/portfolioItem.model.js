'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PortfolioItem extends Model {
    static associate(models) {
      PortfolioItem.belongsTo(models.CraftsmanProfile, { foreignKey: 'craftsman_profile_id', as: 'craftsmanProfile' });
      PortfolioItem.belongsTo(models.OrderRequest, { foreignKey: 'order_request_id', as: 'orderRequest' });
    }
  }

  PortfolioItem.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      craftsman_profile_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      order_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      image_url: { type: DataTypes.STRING(500), allowNull: false },
      caption: { type: DataTypes.STRING(255), allowNull: true },
      is_featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'PortfolioItem',
      tableName: 'portfolio_items',
      underscored: true,
    }
  );

  return PortfolioItem;
};
