'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RegionGroup extends Model {
    static associate(models) {
      RegionGroup.hasMany(models.Product, { foreignKey: 'region_group_id', as: 'products' });
    }
  }

  RegionGroup.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'RegionGroup',
      tableName: 'region_groups',
      underscored: true,
    }
  );

  return RegionGroup;
};
