const DISTRIBUTOR_INVENTORIES_AGGREGATE_QUERY = [
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
              inventory_id: '$sku_items._id',
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

const DISTRIBUTOR_INVENTORY_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'skus',
      localField: 'sku',
      foreignField: '_id',
      as: 'sku',
    },
  },
  {
    $unwind: {
      path: '$sku',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'parentproducts',
      localField: 'sku.parent_product',
      foreignField: '_id',
      as: 'parent_product',
    },
  },
  {
    $unwind: {
      path: '$parent_product',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      inventory_id: '$_id',
      _id: 0,
      sku_id: '$sku._id',
      sku: '$sku.sku',
      name: '$sku.name',
      sku_type: '$sku.sku_type',
      parent_product_name: '$parent_product.name',
      current_inventory_level: 1,
      distributor: 1,
    },
  },
];

module.exports = {
  DISTRIBUTOR_INVENTORIES_AGGREGATE_QUERY,
  DISTRIBUTOR_INVENTORY_AGGREGATE_QUERY,
};
