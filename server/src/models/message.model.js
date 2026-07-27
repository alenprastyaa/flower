'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
      Message.belongsTo(models.User, { foreignKey: 'sender_user_id', as: 'senderUser' });
    }
  }

  Message.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      conversation_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      sender_type: { type: DataTypes.ENUM('buyer', 'user'), allowNull: false },
      sender_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      sender_name: { type: DataTypes.STRING(150), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
      underscored: true,
      updatedAt: false,
    }
  );

  return Message;
};
