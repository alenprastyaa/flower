'use strict';

const PRODUCTS = [
  {
    name: 'Bunga Papan Jambul Kuping Jumbo',
    subtitle: 'Jambul 4 setengah papan',
    price: 1000000,
    category: 'Papan Bunga',
    image_url: 'https://placehold.co/400x300/16a34a/ffffff?text=Jambul+Kuping+Jumbo',
    sort_order: 1,
  },
  {
    name: 'Bunga Papan Jambul 6',
    subtitle: 'Jambul 6, gratis ongkir',
    price: 1000000,
    category: 'Papan Bunga',
    image_url: 'https://placehold.co/400x300/15803d/ffffff?text=Jambul+6',
    sort_order: 2,
  },
  {
    name: 'Bunga Papan Full Atas',
    subtitle: 'Jambul full atas, gratis ongkir',
    price: 900000,
    category: 'Papan Bunga',
    image_url: 'https://placehold.co/400x300/166534/ffffff?text=Full+Atas',
    sort_order: 3,
  },
  {
    name: 'Bunga Papan Kupingan Std (120x200)',
    subtitle: 'Jambul 4, Jabodetabek gratis ongkir',
    price: 750000,
    category: 'Papan Bunga',
    image_url: 'https://placehold.co/400x300/047857/ffffff?text=Kupingan+Std',
    sort_order: 4,
  },
  {
    name: 'Bunga Papan Kupingan Papan Besar (150x200)',
    subtitle: 'Jambul 4, gratis ongkir',
    price: 850000,
    category: 'Papan Bunga',
    image_url: 'https://placehold.co/400x300/059669/ffffff?text=Papan+Besar',
    sort_order: 5,
  },
  {
    name: 'Bunga Papan Std (120x200)',
    subtitle: '2 jambul, gratis ongkir',
    price: 500000,
    category: 'Papan Bunga',
    image_url: 'https://placehold.co/400x300/10b981/ffffff?text=Papan+Std',
    sort_order: 6,
  },
  {
    name: 'Bunga Papan Besar (150x200)',
    subtitle: 'Jambul 2 titik, gratis ongkir',
    price: 600000,
    category: 'Papan Bunga',
    image_url: 'https://placehold.co/400x300/065f46/ffffff?text=Papan+Besar+2',
    sort_order: 7,
  },
  {
    name: 'Buket Bunga Wisuda',
    subtitle: 'Buket segar warna pastel',
    price: 350000,
    category: 'Buket',
    image_url: 'https://placehold.co/400x300/be185d/ffffff?text=Buket+Wisuda',
    sort_order: 8,
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'products',
      PRODUCTS.map((p) => ({
        name: p.name,
        subtitle: p.subtitle,
        price: p.price,
        image_url: p.image_url,
        category: p.category,
        is_active: true,
        sort_order: p.sort_order,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', {});
  },
};
