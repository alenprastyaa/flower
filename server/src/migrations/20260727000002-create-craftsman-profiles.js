'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('craftsman_profiles', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      store_name: { type: Sequelize.STRING(150), allowNull: false },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      bio: { type: Sequelize.TEXT, allowNull: true },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      cover_image_url: { type: Sequelize.STRING(500), allowNull: true },
      city: { type: Sequelize.STRING(100), allowNull: true },
      rating_avg: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      rating_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      commission_rate_override: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('craftsman_profiles', ['city']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('craftsman_profiles');
  },
};
