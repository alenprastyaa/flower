const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const regionService = require('../services/region.service');

// Region codes are dotted numeric strings (e.g. "11", "11.01", "11.01.01").
// Validated before being interpolated into the upstream fetch URL.
const CODE_PATTERN = /^[0-9]{1,4}(\.[0-9]{1,4}){0,3}$/;

function assertValidCode(code) {
  if (!CODE_PATTERN.test(code)) {
    throw new ApiError(400, 'Invalid region code');
  }
}

const listProvinces = asyncHandler(async (req, res) => {
  const data = await regionService.getProvinces();
  res.json({ data });
});

const listRegencies = asyncHandler(async (req, res) => {
  assertValidCode(req.params.provinceCode);
  const data = await regionService.getRegencies(req.params.provinceCode);
  res.json({ data });
});

const listDistricts = asyncHandler(async (req, res) => {
  assertValidCode(req.params.regencyCode);
  const data = await regionService.getDistricts(req.params.regencyCode);
  res.json({ data });
});

const listVillages = asyncHandler(async (req, res) => {
  assertValidCode(req.params.districtCode);
  const data = await regionService.getVillages(req.params.districtCode);
  res.json({ data });
});

module.exports = { listProvinces, listRegencies, listDistricts, listVillages };
