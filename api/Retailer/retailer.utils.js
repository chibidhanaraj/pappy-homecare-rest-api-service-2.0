const { cloneDeep } = require('lodash');
const RetailerSkuInventory = require('../RetailerSkuInventory/retailer-sku-inventory.model');
const RetailerSkuInventoryActivity = require('../RetailerSkuInventoryActivity/retailer-sku-inventory-activity.model');
const { ACTIVITY_CONSTANTS } = require('../../constants/constants');

const RETAILER_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'beats',
      localField: 'beat',
      foreignField: '_id',
      as: 'beat',
    },
  },
  {
    $unwind: { path: '$beat', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'areas',
      localField: 'beat.area',
      foreignField: '_id',
      as: 'area',
    },
  },
  {
    $unwind: { path: '$area', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'districts',
      localField: 'area.district',
      foreignField: '_id',
      as: 'district',
    },
  },
  {
    $unwind: {
      path: '$district',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'district.zone',
      foreignField: '_id',
      as: 'zone',
    },
  },
  {
    $unwind: {
      path: '$zone',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      name: 1,
      contact: 1,
      additional_contacts: 1,
      address: 1,
      gstin: 1,
      retail_type: 1,
      'beat.id': '$beat._id',
      'beat.name': '$beat.name',
      'area.id': '$area._id',
      'area.name': '$area.name',
      'district.id': '$district._id',
      'district.name': '$district.name',
      'zone.id': '$zone._id',
      'zone.name': '$zone.name',
    },
  },
];

const getUpdatedData = (req, retailer) => {
  const dataToUpdate = {};

  if (req.body.name) {
    dataToUpdate.name = req.body.name;
  }

  if (req.body.retail_type) {
    dataToUpdate.retail_type = req.body.retail_type;
  }

  if (req.body.contact) {
    const existingContact = cloneDeep(retailer.contact.toObject());
    dataToUpdate.contact = {
      ...existingContact,
      ...req.body.contact,
    };
  }

  if (req.body.additional_contacts) {
    dataToUpdate.additional_contacts = req.body.additional_contacts;
  }

  if (req.body.gstin !== undefined && req.body.gstin !== null) {
    dataToUpdate.gstin = req.body.gstin;
  }

  if (req.body.address) {
    const existingAddress = cloneDeep(retailer.address.toObject());
    dataToUpdate.address = {
      ...existingAddress,
      ...req.body.address,
    };
  }

  if (req.body.appointed_areas) {
    dataToUpdate.appointed_areas = req.body.appointed_areas;
  }

  if (req.body.beat !== undefined && req.body.beat !== null) {
    if (!req.body.beat) {
      dataToUpdate.beat = undefined;
    } else {
      dataToUpdate.beat = req.body.beat;
    }
  }

  if (req.body.is_appointment_confirmed_by_company) {
    dataToUpdate.is_appointment_confirmed_by_company =
      req.body.is_appointment_confirmed_by_company;
  }

  return dataToUpdate;
};

const incrementRetailerInventoryLevel = async ({
  retailerId,
  skuId,
  quantity,
  distributorId,
}) => {
  const newActivity = new RetailerSkuInventoryActivity({
    retailer: retailerId,
    sku: skuId,
    quantity: quantity,
    comment: ACTIVITY_CONSTANTS.ADD_NEW_STOCK,
    distributor: distributorId,
  });

  await newActivity.save();

  return await RetailerSkuInventory.findOneAndUpdate(
    {
      retailer: retailerId,
      sku: skuId,
    },
    { $inc: { current_inventory_level: Number(quantity) } },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  );
};

const incrementRetailerInventoryLevels = async (order) => {
  const responses = [];
  const { retailer, sku_items, distributor } = order;
  await sku_items.reduce(async (allSkus, sku) => {
    await allSkus;
    const updatedRetailerInventory = await incrementRetailerInventoryLevel({
      retailerId: retailer.id,
      skuId: sku.id,
      quantity: sku.ordered_quantity,
      distributorId: distributor.id,
    });
    responses.push(updatedRetailerInventory);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  RETAILER_AGGREGATE_QUERY,
  getUpdatedData,
  incrementRetailerInventoryLevels,
};
