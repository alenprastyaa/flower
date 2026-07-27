'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderRequest extends Model {
    static associate(models) {
      OrderRequest.belongsTo(models.User, { foreignKey: 'buyer_user_id', as: 'buyerUser' });
      OrderRequest.belongsTo(models.User, { foreignKey: 'reviewed_by_admin_id', as: 'reviewedByAdmin' });
      OrderRequest.belongsTo(models.CraftsmanProfile, { foreignKey: 'claimed_by_craftsman_id', as: 'claimedByCraftsman' });
      OrderRequest.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      OrderRequest.hasOne(models.Campaign, { foreignKey: 'order_request_id', as: 'campaign' });
      OrderRequest.hasMany(models.OrderStatusHistory, { foreignKey: 'order_request_id', as: 'statusHistory' });
      OrderRequest.hasOne(models.Payment, { foreignKey: 'order_request_id', as: 'payment' });
      OrderRequest.hasOne(models.Rating, { foreignKey: 'order_request_id', as: 'rating' });
      OrderRequest.hasMany(models.PortfolioItem, { foreignKey: 'order_request_id', as: 'portfolioItems' });
    }
  }

  OrderRequest.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      buyer_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      buyer_name: { type: DataTypes.STRING(150), allowNull: false },
      buyer_phone: { type: DataTypes.STRING(30), allowNull: false },
      buyer_email: { type: DataTypes.STRING(191), allowNull: true },
      tracking_token: { type: DataTypes.CHAR(36), allowNull: false, unique: true },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      product_image_snapshot: { type: DataTypes.STRING(500), allowNull: true },
      arrangement_type: { type: DataTypes.STRING(100), allowNull: true },
      occasion: { type: DataTypes.STRING(150), allowNull: true },
      needed_by_date: { type: DataTypes.DATEONLY, allowNull: false },
      budget_min: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      budget_max: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: false },
      reference_image_urls: { type: DataTypes.JSON, allowNull: true },
      delivery_address: { type: DataTypes.TEXT, allowNull: false },
      delivery_province: { type: DataTypes.STRING(100), allowNull: true },
      delivery_city: { type: DataTypes.STRING(100), allowNull: true },
      delivery_district: { type: DataTypes.STRING(100), allowNull: true },
      delivery_village: { type: DataTypes.STRING(100), allowNull: true },
      status: {
        type: DataTypes.ENUM(
          'submitted',
          'rejected',
          'approved',
          'published',
          'claimed',
          'in_progress',
          'completed',
          'cancelled',
          'expired'
        ),
        allowNull: false,
        defaultValue: 'submitted',
      },
      admin_notes: { type: DataTypes.TEXT, allowNull: true },
      final_price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      claimed_by_craftsman_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      claimed_at: { type: DataTypes.DATE, allowNull: true },
      reviewed_by_admin_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      reviewed_at: { type: DataTypes.DATE, allowNull: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      commission_rate_applied: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      commission_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      craftsman_earning: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      lock_version: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'OrderRequest',
      tableName: 'order_requests',
      underscored: true,
    }
  );

  return OrderRequest;
};
