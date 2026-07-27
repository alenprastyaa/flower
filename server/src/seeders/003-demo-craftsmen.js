'use strict';
const bcrypt = require('bcryptjs');

const CRAFTSMEN = [
  { full_name: 'Siti Rahayu', email: 'siti@pengrajin.local', store_name: 'Siti Florist', slug: 'siti-florist', city: 'Jakarta Selatan', bio: 'Spesialis papan bunga & buket pernikahan sejak 2015.' },
  { full_name: 'Budi Santoso', email: 'budi@pengrajin.local', store_name: 'Budi Bunga Segar', slug: 'budi-bunga-segar', city: 'Bandung', bio: 'Karangan bunga duka cita dan ucapan selamat, pengerjaan cepat.' },
  { full_name: 'Dewi Lestari', email: 'dewi@pengrajin.local', store_name: 'Dewi Petal Studio', slug: 'dewi-petal-studio', city: 'Jakarta Barat', bio: 'Desain bunga modern & minimalis untuk acara korporat.' },
];

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Pengrajin123!', 10);
    const now = new Date();

    for (const c of CRAFTSMEN) {
      await queryInterface.bulkInsert('users', [
        {
          role: 'pengrajin',
          email: c.email,
          password_hash: passwordHash,
          full_name: c.full_name,
          phone: '0812' + Math.floor(10000000 + Math.random() * 89999999),
          is_active: true,
          is_approved: true,
          created_at: now,
          updated_at: now,
        },
      ]);

      const [rows] = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email = ?',
        { replacements: [c.email] }
      );
      const userId = rows[0].id;

      await queryInterface.bulkInsert('craftsman_profiles', [
        {
          user_id: userId,
          store_name: c.store_name,
          slug: c.slug,
          bio: c.bio,
          avatar_url: null,
          cover_image_url: null,
          city: c.city,
          rating_avg: 0,
          rating_count: 0,
          commission_rate_override: null,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    const emails = CRAFTSMEN.map((c) => c.email);
    await queryInterface.bulkDelete('users', { email: emails });
  },
};
