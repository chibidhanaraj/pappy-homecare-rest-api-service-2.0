const { cloneDeep } = require("lodash");
const { CUSTOMER_CONSTANTS } = require("../constants/constants");
const SuperStockistModel = require("../api/model/SuperStockistModel");
const DistributorModel = require("../api/model/DistributorModel");
const RetailerModel = require("../api/model/RetailerModel");
const UserModel = require("../api/model/UserModel");
const SkuModel = require("../api/model/SkuModel");

const getUserModel = (customerType) => {
  switch (customerType) {
    case CUSTOMER_CONSTANTS.SUPER_STOCKIST:
      return SuperStockistModel;
    case CUSTOMER_CONSTANTS.DISTRIBUTOR:
      return DistributorModel;
    default:
      return RetailerModel;
  }
};

const getUserDetails = async (id) => {
  const user = (await UserModel.findById(id).exec()) || {};

  return {
    id: user.id,
    name: user.name,
    role: user.role,
  };
};

const getCustomerDetails = async (id, customerType) => {
  const CustomerModel = getUserModel(customerType);
  return (await CustomerModel.findById(id).exec()) || {};
};

const normalizeOrderDetails = async (orderPayload) => {
  const order = cloneDeep(orderPayload);
  const customer = await getCustomerDetails(
    order.customerId,
    order.customerType
  );

  const user = await getUserDetails(order.orderTakenBy);
  order.id = orderPayload._id;

  const orderedItems = await Promise.all(
    order.orderedItems.map(async (item) => {
      const Sku = await SkuModel.findById(item.skuId).exec();
      return { ...item, name: Sku.name };
    })
  );

  delete order._id;
  delete order.__v;
  delete order.distributionType;
  delete order.customerType;
  delete order.customerId;
  delete order.orderTakenBy;

  return {
    ...order,
    orderedItems,
    customer: {
      id: customer.id,
      place: (customer && customer.address && customer.address.place) || "",
      name: customer.name,
      customerType: customer.customerType,
      distributionType: customer.distributionType,
    },
    user,
  };
};

const normalizeOrderDetailsPayload = async (orders) => {
  let responses = [];
  await orders.reduce(async (allOrders, order) => {
    await allOrders;
    const newOrder = await normalizeOrderDetails(order);
    responses.push(newOrder);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  normalizeOrderDetailsPayload,
  normalizeOrderDetails,
  getCustomerDetails,
};
