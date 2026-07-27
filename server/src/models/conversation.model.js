'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.OrderRequest, { foreignKey: 'order_request_id', as: 'orderRequest' });
      Conversation.hasMany(models.Message, { foreignKey: 'conversation_id', as: 'messages' });
    }
  }

  Conversation.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.ENUM('buyer_support', 'group'), allowNull: false },
      order_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      visitor_id: { type: DataTypes.STRING(64), allowNull: true },
      visitor_name: { type: DataTypes.STRING(150), allowNull: true },
    },
    {
      sequelize,
      modelName: 'Conversation',
      tableName: 'conversations',
      underscored: true,
    }
  );

  return Conversation;
};
