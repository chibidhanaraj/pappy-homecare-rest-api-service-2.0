const { cloneDeep } = require('lodash');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const SuperStockistSkuInventory = require('../SuperStockistSkuInventory/super-stockist-sku-inventory.model');
const SuperStockistSkuInventoryActivity = require('../SuperStockistSkuInventoryActivity/super-stockist-sku-inventory-activity.model');
const { ACTIVITY_CONSTANTS } = require('../../constants/constants');

const SUPER_STOCKIST_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'districts',
      localField: 'appointed_districts',
      foreignField: '_id',
      as: 'appointed_districts',
    },
  },
  {
    $unwind: { path: '$appointed_districts', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'appointed_districts.zone',
      foreignField: '_id',
      as: 'appointed_districts.zone',
    },
  },
  {
    $unwind: {
      path: '$appointed_districts.zone',
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
      additional_contacts: {
        $first: '$additional_contacts',
      },
      other_brands_dealing_experience: {
        $first: '$other_brands_dealing_experience',
      },
      address: {
        $first: '$address',
      },
      gstin: {
        $first: '$gstin',
      },
      is_appointment_confirmed_by_company: {
        $first: '$is_appointment_confirmed_by_company',
      },
      existing_distributors_count: {
        $first: '$existing_distributors_count',
      },
      appointed_districts: {
        $push: {
          $cond: [
            { $gt: ['$appointed_districts._id', null] },
            {
              id: '$appointed_districts._id',
              name: '$appointed_districts.name',
              zone: {
                id: '$appointed_districts.zone._id',
                name: '$appointed_districts.zone.name',
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
      _id: 0,
    },
  },
  {
    $sort: {
      name: 1,
    },
  },
];

const SUPER_STOCKIST_INVENTORY_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'superstockistskuinventories',
      localField: '_id',
      foreignField: 'super_stockist',
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
              sku: '$sku_items.sku.sku',
              name: '$sku_items.sku.name',
              sku_type: '$sku_items.sku.sku_type',
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

const getUpdatedData = (req, superStockist) => {
  const dataToUpdate = {};

  if (req.body.name) {
    dataToUpdate.name = toWordUpperFirstCase(req.body.name);
  }

  if (req.body.contact) {
    const existingContact = cloneDeep(superStockist.contact.toObject());
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

  if (req.body.address) {
    const existingAddress = cloneDeep(superStockist.address.toObject());
    dataToUpdate.address = {
      ...existingAddress,
      ...req.body.address,
    };
  }

  if (req.body.gstin) {
    dataToUpdate.gstin = req.body.gstin;
  }

  if (req.body.existing_distributors_count) {
    dataToUpdate.existing_distributors_count =
      req.body.existing_distributors_count;
  }

  if (req.body.appointed_districts) {
    dataToUpdate.appointed_districts = req.body.appointed_districts;
  }

  if (req.body.is_appointment_confirmed_by_company) {
    dataToUpdate.is_appointment_confirmed_by_company =
      req.body.is_appointment_confirmed_by_company;
  }

  return dataToUpdate;
};

const incrementSuperStockistInventoryLevel = async ({
  superStockistId,
  skuId,
  quantity,
  orderId,
}) => {
  const newActivity = new SuperStockistSkuInventoryActivity({
    super_stockist: superStockistId,
    sku: skuId,
    quantity: quantity,
    comment: ACTIVITY_CONSTANTS.ADD_NEW_STOCK,
    primary_order: orderId,
  });

  await newActivity.save();

  return await SuperStockistSkuInventory.findOneAndUpdate(
    {
      super_stockist: superStockistId,
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

const incrementSuperStockistInventoryLevels = async (
  superStockistId,
  skus,
  orderId
) => {
  const responses = [];
  await skus.reduce(async (allSkus, sku) => {
    await allSkus;
    const updatedSsInventory = await incrementSuperStockistInventoryLevel({
      superStockistId,
      skuId: sku.id,
      quantity: sku.ordered_quantity,
      orderId: orderId,
    });
    responses.push(updatedSsInventory);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  SUPER_STOCKIST_AGGREGATE_QUERY,
  SUPER_STOCKIST_INVENTORY_AGGREGATE_QUERY,
  getUpdatedData,
  incrementSuperStockistInventoryLevels,
};
