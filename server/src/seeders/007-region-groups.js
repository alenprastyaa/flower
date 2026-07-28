'use strict';

const REGION_GROUPS = [
  { name: 'Jabodetabek', sort_order: 1 },
  { name: 'Jawa', sort_order: 2 },
  { name: 'Sumatra', sort_order: 3 },
  { name: 'Kalimantan, Sulawesi, Papua & Lainnya', sort_order: 4 },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'region_groups',
      REGION_GROUPS.map((r) => ({
        name: r.name,
        image_url: null,
        is_active: true,
        sort_order: r.sort_order,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('region_groups', {});
  },
};
