'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

    const [admins] = await queryInterface.sequelize.query("SELECT id FROM users WHERE role = 'superadmin' LIMIT 1");
    const adminId = admins[0].id;

    const [craftsmen] = await queryInterface.sequelize.query(
      "SELECT cp.id as profile_id, cp.slug FROM craftsman_profiles cp ORDER BY cp.id ASC"
    );
    const [siti, budi, dewi] = craftsmen;

    const [products] = await queryInterface.sequelize.query(
      'SELECT id, name, price, image_url FROM products ORDER BY sort_order ASC'
    );
    const productByIndex = (i) => products[i % products.length];

    const baseOrder = (product, overrides) => ({
      buyer_user_id: null,
      buyer_name: 'Pembeli Contoh',
      buyer_phone: '0813' + Math.floor(10000000 + Math.random() * 89999999),
      buyer_email: null,
      tracking_token: uuidv4(),
      product_id: product.id,
      product_image_snapshot: product.image_url,
      arrangement_type: product.name,
      occasion: 'ucapan selamat',
      needed_by_date: inDays(5),
      description: 'Turut berbahagia, semoga sukses selalu.',
      reference_image_urls: null,
      delivery_address: 'Jl. Contoh No. 1, Jakarta',
      delivery_city: 'Jakarta',
      status: 'submitted',
      admin_notes: null,
      final_price: product.price,
      claimed_by_craftsman_id: null,
      claimed_at: null,
      reviewed_by_admin_id: null,
      reviewed_at: null,
      completed_at: null,
      commission_rate_applied: null,
      commission_amount: null,
      craftsman_earning: null,
      lock_version: 0,
      created_at: now,
      updated_at: now,
      ...overrides,
    });

    const orders = [
      baseOrder(productByIndex(0), {
        occasion: 'pembukaan toko',
        description: 'Selamat & Sukses atas pembukaan toko baru.',
        status: 'submitted',
      }),
      baseOrder(productByIndex(7), {
        occasion: 'wisuda',
        description: 'Selamat wisuda, semoga sukses ke depannya.',
        status: 'approved',
        admin_notes: 'Alamat sudah dikonfirmasi via telepon.',
        reviewed_by_admin_id: adminId,
        reviewed_at: now,
      }),
      baseOrder(productByIndex(3), {
        occasion: 'duka cita',
        description: 'Turut Berduka Cita, semoga husnul khotimah.',
        status: 'published',
        reviewed_by_admin_id: adminId,
        reviewed_at: now,
      }),
      baseOrder(productByIndex(1), {
        occasion: 'pernikahan',
        description: 'Happy Wedding, semoga menjadi keluarga sakinah.',
        status: 'claimed',
        reviewed_by_admin_id: adminId,
        reviewed_at: now,
        claimed_by_craftsman_id: siti.profile_id,
        claimed_at: now,
        commission_rate_applied: 15,
        commission_amount: Math.round(products[1 % products.length].price * 0.15),
        craftsman_earning: Math.round(products[1 % products.length].price * 0.85),
      }),
      baseOrder(productByIndex(5), {
        occasion: 'ulang tahun',
        description: 'Selamat ulang tahun, semoga panjang umur.',
        status: 'completed',
        reviewed_by_admin_id: adminId,
        reviewed_at: now,
        claimed_by_craftsman_id: budi.profile_id,
        claimed_at: now,
        completed_at: now,
        commission_rate_applied: 15,
        commission_amount: Math.round(products[5 % products.length].price * 0.15),
        craftsman_earning: Math.round(products[5 % products.length].price * 0.85),
      }),
    ];

    await queryInterface.bulkInsert('order_requests', orders);

    const [inserted] = await queryInterface.sequelize.query(
      'SELECT id, status, final_price, needed_by_date, claimed_by_craftsman_id, claimed_at, arrangement_type FROM order_requests ORDER BY id ASC'
    );

    const published = inserted.find((o) => o.status === 'published');
    const claimed = inserted.find((o) => o.status === 'claimed');
    const completed = inserted.find((o) => o.status === 'completed');

    await queryInterface.bulkInsert('campaigns', [
      {
        order_request_id: published.id,
        title: `${published.arrangement_type} - Jakarta`,
        public_summary: 'Turut Berduka Cita, dibutuhkan dalam 5 hari.',
        city: 'Jakarta',
        price: published.final_price,
        needed_by_date: published.needed_by_date,
        status: 'open',
        claimed_by_craftsman_id: null,
        published_at: now,
        claimed_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        order_request_id: claimed.id,
        title: `${claimed.arrangement_type} - Jakarta`,
        public_summary: 'Happy Wedding, semoga menjadi keluarga sakinah.',
        city: 'Jakarta',
        price: claimed.final_price,
        needed_by_date: claimed.needed_by_date,
        status: 'claimed',
        claimed_by_craftsman_id: claimed.claimed_by_craftsman_id,
        published_at: now,
        claimed_at: claimed.claimed_at,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('payments', [
      { order_request_id: published.id, amount: published.final_price, currency: 'IDR', status: 'unpaid', method: 'manual', created_at: now, updated_at: now },
      { order_request_id: claimed.id, amount: claimed.final_price, currency: 'IDR', status: 'unpaid', method: 'manual', created_at: now, updated_at: now },
      { order_request_id: completed.id, amount: completed.final_price, currency: 'IDR', status: 'paid', method: 'manual', paid_at: now, marked_by_admin_id: adminId, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('ratings', [
      {
        order_request_id: completed.id,
        craftsman_profile_id: completed.claimed_by_craftsman_id,
        stars: 5,
        comment: 'Bunga segar, pengerjaan rapi dan tepat waktu.',
        created_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_requests', {});
  },
};
