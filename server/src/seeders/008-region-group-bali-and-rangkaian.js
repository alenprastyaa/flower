'use strict';

// Adds the Bali region and re-categorizes the demo "Buket Bunga Wisuda"
// product as "Rangkaian", available only in Jabodetabek, Jawa, and Bali
// (one product row per region, matching the single-region-per-product model).
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const [existingBali] = await queryInterface.sequelize.query(
      "SELECT id FROM region_groups WHERE name = 'Bali' LIMIT 1"
    );
    let baliId = existingBali[0]?.id;
    if (!baliId) {
      await queryInterface.bulkInsert('region_groups', [
        { name: 'Bali', image_url: null, is_active: true, sort_order: 5, created_at: now, updated_at: now },
      ]);
      const [rows] = await queryInterface.sequelize.query("SELECT id FROM region_groups WHERE name = 'Bali' LIMIT 1");
      baliId = rows[0].id;
    }

    const [jabodetabek] = await queryInterface.sequelize.query(
      "SELECT id FROM region_groups WHERE name = 'Jabodetabek' LIMIT 1"
    );
    const [jawa] = await queryInterface.sequelize.query("SELECT id FROM region_groups WHERE name = 'Jawa' LIMIT 1");
    const jabodetabekId = jabodetabek[0].id;
    const jawaId = jawa[0].id;

    const [existingProduct] = await queryInterface.sequelize.query(
      "SELECT id FROM products WHERE name = 'Buket Bunga Wisuda' AND region_group_id IS NULL LIMIT 1"
    );
    if (existingProduct[0]) {
      await queryInterface.bulkUpdate(
        'products',
        { category: 'Rangkaian', region_group_id: jabodetabekId, updated_at: now },
        { id: existingProduct[0].id }
      );
    }

    const clone = (regionId, sortOrder) => ({
      name: 'Buket Bunga Wisuda',
      subtitle: 'Buket segar warna pastel',
      price: 350000,
      image_url: 'https://placehold.co/400x300/be185d/ffffff?text=Buket+Wisuda',
      category: 'Rangkaian',
      region_group_id: regionId,
      is_active: true,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    });

    const [existingJawaClone] = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE name = 'Buket Bunga Wisuda' AND region_group_id = ${jawaId} LIMIT 1`
    );
    if (!existingJawaClone[0]) {
      await queryInterface.bulkInsert('products', [clone(jawaId, 9)]);
    }

    const [existingBaliClone] = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE name = 'Buket Bunga Wisuda' AND region_group_id = ${baliId} LIMIT 1`
    );
    if (!existingBaliClone[0]) {
      await queryInterface.bulkInsert('products', [clone(baliId, 10)]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', { name: 'Buket Bunga Wisuda', category: 'Rangkaian' });
    await queryInterface.bulkDelete('region_groups', { name: 'Bali' });
  },
};
