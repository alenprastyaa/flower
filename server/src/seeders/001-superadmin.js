'use strict';
const bcrypt = require('bcryptjs');
const env = require('../config/env');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash(env.superadmin.password, 10);
    await queryInterface.bulkInsert('users', [
      {
        role: 'superadmin',
        email: env.superadmin.email,
        password_hash: passwordHash,
        full_name: 'Super Admin',
        phone: null,
        is_active: true,
        is_approved: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { role: 'superadmin' });
  },
};
