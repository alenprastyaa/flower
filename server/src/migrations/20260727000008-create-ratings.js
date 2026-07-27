'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ratings', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_request_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: 'order_requests', key: 'id' },
        onDelete: 'CASCADE',
      },
      craftsman_profile_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'craftsman_profiles', key: 'id' },
        onDelete: 'CASCADE',
      },
      stars: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
      comment: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('ratings', ['craftsman_profile_id']);
    await queryInterface.addConstraint('ratings', {
      fields: ['stars'],
      type: 'check',
      name: 'ratings_stars_between_1_and_5',
      where: { stars: { [Sequelize.Op.between]: [1, 5] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ratings');
  },
};
