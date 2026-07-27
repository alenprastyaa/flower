'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.OrderRequest, { foreignKey: 'order_request_id', as: 'orderRequest' });
      Rating.belongsTo(models.CraftsmanProfile, { foreignKey: 'craftsman_profile_id', as: 'craftsmanProfile' });
    }
  }

  Rating.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
      craftsman_profile_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      stars: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
      comment: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      sequelize,
      modelName: 'Rating',
      tableName: 'ratings',
      underscored: true,
      updatedAt: false,
    }
  );

  return Rating;
};
