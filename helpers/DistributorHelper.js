const { cloneDeep } = require("lodash");

const buildDistributorPayload = (distributorData) => {
  const distributor = cloneDeep(distributorData);

  distributor.id = distributor._id;
  distributor.superStockistId = distributor.superStockistId || "";
  distributor.superStockist = distributor.superStockist || {};

  delete distributor._id;
  delete distributor.__v;

  return distributor;
};

const buildAllDistributorsPayload = (distributors) => {
  return distributors.reduce((allDistributors, distributor) => {
    return [...allDistributors, buildDistributorPayload(distributor)];
  }, []);
};

module.exports = {
  buildDistributorPayload,
  buildAllDistributorsPayload,
};
