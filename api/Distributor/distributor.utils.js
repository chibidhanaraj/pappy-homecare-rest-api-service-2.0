const { cloneDeep, get } = require('lodash');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const DistributorSkuInventory = require('../DistributorSkuInventory/distributor-sku-inventory.model');
const DistributorSkuInventoryActivity = require('../DistributorSkuInventoryActivity/distributor-sku-inventory-activity.model');
const { ACTIVITY_CONSTANTS } = require('../../constants/constants');

const DISTRIBUTOR_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'areas',
      localField: 'appointed_areas',
      foreignField: '_id',
      as: 'appointed_areas',
    },
  },
  {
    $unwind: { path: '$appointed_areas', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'districts',
      localField: 'appointed_areas.district',
      foreignField: '_id',
      as: 'appointed_areas.district',
    },
  },
  {
    $unwind: {
      path: '$appointed_areas.district',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'appointed_areas.district.zone',
      foreignField: '_id',
      as: 'appointed_areas.district.zone',
    },
  },
  {
    $unwind: {
      path: '$appointed_areas.district.zone',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: '$_id',
      id: {
        $first: '$_id',
      },
      name: {
        $first: '$name',
      },
      contact: {
        $first: '$contact',
      },
      address: {
        $first: '$address',
      },
      additional_contacts: {
        $first: '$additional_contacts',
      },
      other_brands_dealing_experience: {
        $first: '$other_brands_dealing_experience',
      },
      gstin: {
        $first: '$gstin',
      },
      is_appointment_confirmed_by_company: {
        $first: '$is_appointment_confirmed_by_company',
      },
      distribution_type: {
        $first: '$distribution_type',
      },
      delivery_vehicles_count: {
        $first: '$delivery_vehicles_count',
      },
      existing_retailers_count: {
        $first: '$existing_retailers_count',
      },
      appointed_areas: {
        $push: {
          $cond: [
            { $gt: ['$appointed_areas._id', null] },
            {
              id: '$appointed_areas._id',
              name: '$appointed_areas.name',
              district: {
                id: '$appointed_areas.district._id',
                name: '$appointed_areas.district.name',
              },
              zone: {
                id: '$appointed_areas.district.zone._id',
                name: '$appointed_areas.district.zone.name',
              },
            },
            '$$REMOVE',
          ],
        },
      },
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      name: 1,
      contact: 1,
      additional_contacts: 1,
      other_brands_dealing_experience: 1,
      address: 1,
      gstin: 1,
      is_appointment_confirmed_by_company: 1,
      distribution_type: 1,
      delivery_vehicles_count: 1,
      existing_retailers_count: 1,
      appointed_areas: 1,
    },
  },
  {
    $sort: {
      name: 1,
    },
  },
];

const DISTRIBUTOR_INVENTORY_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'distributorskuinventories',
      localField: '_id',
      foreignField: 'distributor',
      as: 'sku_items',
    },
  },
  {
    $unwind: { path: '$sku_items', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'skus',
      localField: 'sku_items.sku',
      foreignField: '_id',
      as: 'sku_items.sku',
    },
  },
  {
    $unwind: {
      path: '$sku_items.sku',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'parentproducts',
      localField: 'sku_items.sku.parent_product',
      foreignField: '_id',
      as: 'sku_items.parent_product',
    },
  },
  {
    $unwind: {
      path: '$sku_items.parent_product',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: '$_id',
      id: {
        $first: '$_id',
      },
      sku_items: {
        $push: {
          $cond: [
            { $gt: ['$sku_items._id', null] },
            {
              sku_id: '$sku_items.sku._id',
              name: '$sku_items.sku.name',
              parent_product_name: '$sku_items.parent_product.name',
              current_inventory_level: '$sku_items.current_inventory_level',
            },
            '$$REMOVE',
          ],
        },
      },
      name: {
        $first: '$name',
      },
    },
  },
  {
    $project: {
      _id: 0,
    },
  },
];

const getUpdatedData = (req, distributor) => {
  const dataToUpdate = {};

  if (req.body.name) {
    dataToUpdate.name = toWordUpperFirstCase(req.body.name);
  }

  if (req.body.distribution_type) {
    dataToUpdate.distribution_type = req.body.distribution_type;
  }

  if (req.body.contact) {
    const existingContact = cloneDeep(distributor.contact.toObject());
    dataToUpdate.contact = {
      ...existingContact,
      ...req.body.contact,
    };
  }

  if (req.body.additional_contacts) {
    dataToUpdate.additional_contacts = req.body.additional_contacts;
  }

  if (req.body.other_brands_dealing_experience) {
    dataToUpdate.other_brands_dealing_experience =
      req.body.other_brands_dealing_experience;
  }

  if (req.body.gstin !== undefined && req.body.gstin !== null) {
    dataToUpdate.gstin = req.body.gstin;
  }

  if (req.body.address) {
    const existingAddress = cloneDeep(distributor.address.toObject());
    dataToUpdate.address = {
      ...existingAddress,
      ...req.body.address,
    };
  }

  if (req.body.appointed_areas) {
    dataToUpdate.appointed_areas = req.body.appointed_areas;
  }

  if (req.body.existing_retailers_count) {
    dataToUpdate.existing_retailers_count = req.body.existing_retailers_count;
  }

  if (req.body.delivery_vehicles_count) {
    dataToUpdate.delivery_vehicles_count = req.body.delivery_vehicles_count;
  }

  if (req.body.is_appointment_confirmed_by_company) {
    dataToUpdate.is_appointment_confirmed_by_company =
      req.body.is_appointment_confirmed_by_company;
  }

  return dataToUpdate;
};

const incrementDistributorInventoryLevel = async ({
  distributorId,
  skuId,
  quantity,
  primaryOrderId,
  secondPrimaryOrderId,
}) => {
  const newActivity = new DistributorSkuInventoryActivity({
    distributor: distributorId,
    sku: skuId,
    quantity: quantity,
    comment: ACTIVITY_CONSTANTS.ADD_NEW_STOCK,
    primary_order: primaryOrderId ? primaryOrderId : null,
    second_primary_order: secondPrimaryOrderId ? secondPrimaryOrderId : null,
  });

  await newActivity.save();

  return await DistributorSkuInventory.findOneAndUpdate(
    {
      distributor: distributorId,
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

const incrementDistributorInventoryLevels = async ({
  distributorId,
  skus,
  primaryOrderId,
  secondPrimaryOrderId,
}) => {
  const responses = [];
  await skus.reduce(async (allSkus, sku) => {
    await allSkus;
    const updatedDbrInventory = await incrementDistributorInventoryLevel({
      distributorId,
      skuId: sku.id,
      quantity: sku.ordered_quantity,
      primaryOrderId,
      secondPrimaryOrderId,
    });
    responses.push(updatedDbrInventory);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  DISTRIBUTOR_AGGREGATE_QUERY,
  DISTRIBUTOR_INVENTORY_AGGREGATE_QUERY,
  getUpdatedData,
  incrementDistributorInventoryLevels,
};
