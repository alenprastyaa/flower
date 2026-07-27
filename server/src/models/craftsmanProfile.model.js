'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CraftsmanProfile extends Model {
    static associate(models) {
      CraftsmanProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      CraftsmanProfile.hasMany(models.PortfolioItem, { foreignKey: 'craftsman_profile_id', as: 'portfolioItems' });
      CraftsmanProfile.hasMany(models.OrderRequest, { foreignKey: 'claimed_by_craftsman_id', as: 'claimedOrders' });
      CraftsmanProfile.hasMany(models.Campaign, { foreignKey: 'claimed_by_craftsman_id', as: 'claimedCampaigns' });
      CraftsmanProfile.hasMany(models.Rating, { foreignKey: 'craftsman_profile_id', as: 'ratings' });
    }
  }

  CraftsmanProfile.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
      store_name: { type: DataTypes.STRING(150), allowNull: false },
      slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      bio: { type: DataTypes.TEXT, allowNull: true },
      avatar_url: { type: DataTypes.STRING(500), allowNull: true },
      cover_image_url: { type: DataTypes.STRING(500), allowNull: true },
      province: { type: DataTypes.STRING(100), allowNull: true },
      city: { type: DataTypes.STRING(100), allowNull: true },
      rating_avg: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      rating_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      commission_rate_override: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    },
    {
      sequelize,
      modelName: 'CraftsmanProfile',
      tableName: 'craftsman_profiles',
      underscored: true,
    }
  );

  return CraftsmanProfile;
};
