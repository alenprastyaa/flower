function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueSlug(baseText, existsFn) {
  const base = slugify(baseText) || 'toko';
  let slug = base;
  let suffix = 1;
  while (await existsFn(slug)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

module.exports = { slugify, uniqueSlug };
