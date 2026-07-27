const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Indonesian administrative region data barely ever changes, so an
// in-memory cache (per server process) with a generous TTL avoids hammering
// the upstream public API on every keystroke of the cascading selects.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const cache = new Map();

async function fetchRegion(path) {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  let res;
  try {
    res = await fetch(`${env.regionApiBaseUrl}/${path}`);
  } catch (err) {
    throw new ApiError(502, 'Region data service unreachable');
  }

  if (!res.ok) {
    throw new ApiError(502, 'Region data service failed');
  }

  const body = await res.json().catch(() => null);
  const data = body?.data;
  if (!Array.isArray(data)) {
    throw new ApiError(502, 'Region data service returned unexpected response');
  }

  cache.set(path, { data, at: Date.now() });
  return data;
}

const getProvinces = () => fetchRegion('provinces.json');
const getRegencies = (provinceCode) => fetchRegion(`regencies/${provinceCode}.json`);
const getDistricts = (regencyCode) => fetchRegion(`districts/${regencyCode}.json`);
const getVillages = (districtCode) => fetchRegion(`villages/${districtCode}.json`);

module.exports = { getProvinces, getRegencies, getDistricts, getVillages };
