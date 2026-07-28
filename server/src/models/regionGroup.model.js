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
      // Official wilayah.id province name this business region maps to
      // 1:1 (e.g. "Bali" -> "Bali"), used to pre-fill the delivery address
      // province on the order form. Left null for regions spanning more
      // than one official province (e.g. "Jabodetabek", "Sumatra").
      province_name: { type: DataTypes.STRING(150), allowNull: true },
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
