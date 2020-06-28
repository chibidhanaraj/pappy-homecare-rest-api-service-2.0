const { cloneDeep } = require("lodash");

const buildRetailerPayload = (retailerData) => {
  const retailer = cloneDeep(retailerData);

  retailer.id = retailer._id;
  retailer.zoneId = retailer.zoneId || "";
  retailer.districtId = retailer.districtId || "";
  retailer.areaId = retailer.areaId || "";
  retailer.beatAreaId = retailer.beatAreaId || "";
  retailer.distributorId = retailer.distributorId || "";
  retailer.zone = retailer.zone || {};
  retailer.district = retailer.district || {};
  retailer.area = retailer.area || {};
  retailer.beatArea = retailer.beatArea || {};
  retailer.distributor = retailer.distributor || {};

  delete retailer._id;
  delete retailer.__v;

  return retailer;
};

const buildAllRetailersPayload = (retailers) => {
  return retailers.reduce((allRetailers, retailer) => {
    return [...allRetailers, buildRetailerPayload(retailer)];
  }, []);
};

module.exports = {
  buildRetailerPayload,
  buildAllRetailersPayload,
};
