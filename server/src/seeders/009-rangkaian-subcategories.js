'use strict';

// Restructures "Rangkaian" into a category group with 5 sub-types:
// Bucket (existing, renamed from a flat "Rangkaian" category), plus
// Standing Flower, Bunga Meja, Paket Duka, and Parcel Buah as inactive
// placeholders — one row per region (Jabodetabek, Jawa, Bali) each, so
// admin only needs to fill in real price/image/photo and flip is_active.
const NEW_SUBCATEGORIES = ['Standing Flower', 'Bunga Meja', 'Paket Duka', 'Parcel Buah'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1) Existing "Buket Bunga Wisuda" x3 (one per region) -> category "Bucket"
    //    under the "Rangkaian" group.
    await queryInterface.bulkUpdate(
      'products',
      { category: 'Bucket', category_group: 'Rangkaian', updated_at: now },
      { name: 'Buket Bunga Wisuda', category: 'Rangkaian' }
    );

    const [regions] = await queryInterface.sequelize.query(
      "SELECT id, name FROM region_groups WHERE name IN ('Jabodetabek', 'Jawa', 'Bali')"
    );
    const regionIds = regions.map((r) => r.id);

    for (const subcategory of NEW_SUBCATEGORIES) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT region_group_id FROM products WHERE category = ${queryInterface.sequelize.escape(
          subcategory
        )} AND category_group = 'Rangkaian'`
      );
      const existingRegionIds = new Set(existing.map((r) => r.region_group_id));

      const rows = regionIds
        .filter((id) => !existingRegionIds.has(id))
        .map((regionId, i) => ({
          name: subcategory,
          subtitle: 'Segera hadir — harga & foto menyusul',
          price: 350000,
          image_url: `https://placehold.co/400x300/9d174d/ffffff?text=${encodeURIComponent(subcategory)}`,
          category: subcategory,
          category_group: 'Rangkaian',
          region_group_id: regionId,
          is_active: false,
          sort_order: 20 + NEW_SUBCATEGORIES.indexOf(subcategory) * 3 + i,
          created_at: now,
          updated_at: now,
        }));

      if (rows.length) {
        await queryInterface.bulkInsert('products', rows);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', { category_group: 'Rangkaian', category: NEW_SUBCATEGORIES });
    await queryInterface.bulkUpdate(
      'products',
      { category: 'Rangkaian', category_group: null },
      { category: 'Bucket', category_group: 'Rangkaian' }
    );
  },
};
