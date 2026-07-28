'use strict';

// Spreads existing "Papan Bunga" products (category, no group, universal —
// i.e. not yet region-tagged) across 5 regions: JABAR, JATIM & JATENG, Bali,
// Sumatra, and Kalimantan/Sulawesi/Papua & Lainnya. Reads each product's
// CURRENT live values (name/subtitle/price/image_url) rather than hardcoding
// anything, since these are real admin-edited listings, not demo data. The
// original row is converted in place to the first region (preserves its id
// for any existing FK references); the other 4 regions get cloned copies.
const TARGET_REGION_NAMES = ['JABAR', 'JATIM, JATENG', 'Bali', 'Sumatra', 'Kalimantan, Sulawesi, Papua & Lainnya'];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1) Ensure the two new region groups exist.
    const [existingRegions] = await queryInterface.sequelize.query(
      `SELECT id, name FROM region_groups WHERE name IN ('JABAR', 'JATIM, JATENG')`
    );
    const existingNames = new Set(existingRegions.map((r) => r.name));
    const [maxSort] = await queryInterface.sequelize.query('SELECT MAX(sort_order) as m FROM region_groups');
    let nextSort = (maxSort[0].m || 0) + 1;

    const toCreate = ['JABAR', 'JATIM, JATENG'].filter((n) => !existingNames.has(n));
    if (toCreate.length) {
      await queryInterface.bulkInsert(
        'region_groups',
        toCreate.map((name) => ({
          name,
          image_url: null,
          is_active: true,
          sort_order: nextSort++,
          created_at: now,
          updated_at: now,
        }))
      );
    }

    const [allTargetRegions] = await queryInterface.sequelize.query(
      `SELECT id, name FROM region_groups WHERE name IN (${TARGET_REGION_NAMES.map((n) =>
        queryInterface.sequelize.escape(n)
      ).join(',')})`
    );
    const regionByName = Object.fromEntries(allTargetRegions.map((r) => [r.name, r.id]));
    const orderedRegionIds = TARGET_REGION_NAMES.map((n) => regionByName[n]);

    // 2) Idempotency guard: if any Papan Bunga product already carries one of
    // these region ids, assume this seeder already ran.
    const [already] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as c FROM products WHERE category = 'Papan Bunga' AND region_group_id IN (${orderedRegionIds.join(
        ','
      )})`
    );
    if (already[0].c > 0) return;

    // 3) Universal Papan Bunga products (not yet region-tagged).
    const [universalProducts] = await queryInterface.sequelize.query(
      "SELECT * FROM products WHERE category = 'Papan Bunga' AND region_group_id IS NULL"
    );

    for (const product of universalProducts) {
      const [primaryRegionId, ...cloneRegionIds] = orderedRegionIds;

      await queryInterface.bulkUpdate(
        'products',
        { region_group_id: primaryRegionId, updated_at: now },
        { id: product.id }
      );

      const clones = cloneRegionIds.map((regionId, i) => ({
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        category_group: product.category_group,
        region_group_id: regionId,
        is_active: product.is_active,
        sort_order: product.sort_order,
        created_at: now,
        updated_at: now,
      }))

      if (clones.length) {
        await queryInterface.bulkInsert('products', clones);
      }
    }
  },

  async down(queryInterface) {
    const [regions] = await queryInterface.sequelize.query(
      `SELECT id FROM region_groups WHERE name IN (${TARGET_REGION_NAMES.map((n) =>
        queryInterface.sequelize.escape(n)
      ).join(',')})`
    );
    const ids = regions.map((r) => r.id);
    if (ids.length) {
      await queryInterface.sequelize.query(
        `DELETE FROM products WHERE category = 'Papan Bunga' AND region_group_id IN (${ids.join(',')}) AND id NOT IN (
          SELECT id FROM (SELECT MIN(id) as id FROM products WHERE category = 'Papan Bunga' GROUP BY name) t
        )`
      );
      await queryInterface.sequelize.query(
        `UPDATE products SET region_group_id = NULL WHERE category = 'Papan Bunga' AND region_group_id IN (${ids.join(',')})`
      );
    }
    await queryInterface.bulkDelete('region_groups', { name: ['JABAR', 'JATIM, JATENG'] });
  },
};
