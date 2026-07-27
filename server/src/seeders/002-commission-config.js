'use strict';
const env = require('../config/env');

module.exports = {
  async up(queryInterface) {
    const [admin] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'superadmin' LIMIT 1"
    );
    const adminId = admin[0] ? admin[0].id : null;

    await queryInterface.bulkInsert('commission_configs', [
      {
        rate_percent: env.defaultCommissionRate,
        is_active: true,
        effective_from: new Date(),
        created_by_user_id: adminId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('commission_configs', {});
  },
};
