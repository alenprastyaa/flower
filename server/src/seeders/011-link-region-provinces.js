'use strict';

// Links region groups that map 1:1 to a single official wilayah.id province,
// so the delivery address form can pre-fill the province once a buyer has
// already picked that region on the landing page. Multi-province regions
// (Jabodetabek, Jawa, Sumatra, JATIM & JATENG, Kalimantan/Sulawesi/Papua &
// Lainnya) are intentionally left unlinked.
const LINKS = {
  Bali: 'Bali',
  JABAR: 'Jawa Barat',
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    for (const [regionName, provinceName] of Object.entries(LINKS)) {
      await queryInterface.bulkUpdate(
        'region_groups',
        { province_name: provinceName, updated_at: now },
        { name: regionName }
      );
    }
  },

  async down(queryInterface) {
    for (const regionName of Object.keys(LINKS)) {
      await queryInterface.bulkUpdate('region_groups', { province_name: null }, { name: regionName });
    }
  },
};
