'use strict';
const sequelize = require('../config/database');

const models = {
  User: require('./user.model')(sequelize),
  CraftsmanProfile: require('./craftsmanProfile.model')(sequelize),
  PortfolioItem: require('./portfolioItem.model')(sequelize),
  Product: require('./product.model')(sequelize),
  RegionGroup: require('./regionGroup.model')(sequelize),
  OrderRequest: require('./orderRequest.model')(sequelize),
  Campaign: require('./campaign.model')(sequelize),
  OrderStatusHistory: require('./orderStatusHistory.model')(sequelize),
  Payment: require('./payment.model')(sequelize),
  CommissionConfig: require('./commissionConfig.model')(sequelize),
  Rating: require('./rating.model')(sequelize),
  Conversation: require('./conversation.model')(sequelize),
  Message: require('./message.model')(sequelize),
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
