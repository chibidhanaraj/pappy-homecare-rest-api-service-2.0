const SECONDARY_ORDERS_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'secondaryorderskuitems',
      localField: 'sku_items',
      foreignField: '_id',
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
    $project: {
      id: '$_id',
      'sku_item.id': '$sku_items.sku._id',
      'sku_item.ordered_quantity': '$sku_items.ordered_quantity',
      'sku_item.final_quantity': '$sku_items.final_quantity',
      'sku_item.total_cost': '$sku_items.total_cost',
      invoice_number: 1,
      customer_type: 1,
      retailer: 1,
      distributor: 1,
      created_by: 1,
      updated_by: 1,
      note: 1,
      status: 1,
      updatedAt: 1,
      createdAt: 1,
    },
  },
  {
    $group: {
      _id: '$_id',
      id: {
        $first: '$_id',
      },
      total_order_value: {
        $sum: { $toDouble: '$sku_item.total_cost' },
      },
      sku_items: {
        $push: '$sku_item',
      },
      invoice_number: {
        $first: '$invoice_number',
      },
      customer_type: {
        $first: '$customer_type',
      },
      retailer: {
        $first: '$retailer',
      },
      distributor: {
        $first: '$distributor',
      },
      created_by: {
        $first: '$created_by',
      },
      updated_by: {
        $first: '$updated_by',
      },
      createdAt: {
        $first: '$createdAt',
      },
      updatedAt: {
        $first: '$updatedAt',
      },
      status: {
        $first: '$status',
      },
    },
  },
  {
    $lookup: {
      from: 'retailers',
      localField: 'retailer',
      foreignField: '_id',
      as: 'retailer',
    },
  },
  {
    $unwind: {
      path: '$retailer',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'beats',
      localField: 'retailer.beat',
      foreignField: '_id',
      as: 'beat',
    },
  },
  {
    $unwind: {
      path: '$beat',
      preserveNullAndEmptyArrays: true,
    },
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
    $unwind: {
      path: '$area',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'distributors',
      localField: 'distributor',
      foreignField: '_id',
      as: 'distributor',
    },
  },
  {
    $unwind: {
      path: '$distributor',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'created_by',
      foreignField: '_id',
      as: 'user',
    },
  },
  {
    $unwind: {
      path: '$user',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      total_order_value: { $trunc: ['$total_order_value', 2] },
      sku_items: 1,
      invoice_number: 1,
      'retailer.id': '$retailer._id',
      'retailer.name': '$retailer.name',
      'distributor.id': '$distributor._id',
      'distributor.name': '$distributor.name',
      'beat.id': '$beat._id',
      'beat.name': '$beat.name',
      'area.id': '$area._id',
      'area.name': '$area.name',
      orderTakenBy: '$user.name',
      created_by: 1,
      updated_by: 1,
      note: 1,
      status: 1,
      updatedAt: 1,
      createdAt: 1,
    },
  },
];

const SECONDARY_ORDER_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'secondaryorderskuitems',
      localField: 'sku_items',
      foreignField: '_id',
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
    $project: {
      id: '$_id',
      'sku_item.id': '$sku_items.sku._id',
      'sku_item.sku': '$sku_items.sku.sku',
      'sku_item.name': '$sku_items.sku.name',
      'sku_item.mrp': '$sku_items.sku.mrp',
      'sku_item.parent_product_name': '$sku_items.parent_product.name',
      'sku_item.ordered_quantity': '$sku_items.ordered_quantity',
      'sku_item.final_quantity': '$sku_items.final_quantity',
      'sku_item.margin': '$sku_items.margin',
      'sku_item.landed_cost': '$sku_items.landed_cost',
      'sku_item.total_cost': '$sku_items.total_cost',
      invoice_number: 1,
      retailer: 1,
      distributor: 1,
      created_by: 1,
      updated_by: 1,
      note: 1,
      status: 1,
      updatedAt: 1,
      createdAt: 1,
    },
  },
  {
    $group: {
      _id: '$_id',
      id: {
        $first: '$_id',
      },
      total_order_value: {
        $sum: { $toDouble: '$sku_item.total_cost' },
      },
      sku_items: {
        $push: '$sku_item',
      },
      invoice_number: {
        $first: '$invoice_number',
      },
      customer_type: {
        $first: '$customer_type',
      },
      retailer: {
        $first: '$retailer',
      },
      distributor: {
        $first: '$distributor',
      },
      created_by: {
        $first: '$created_by',
      },
      updated_by: {
        $first: '$updated_by',
      },
      createdAt: {
        $first: '$createdAt',
      },
      updatedAt: {
        $first: '$updatedAt',
      },
      status: {
        $first: '$status',
      },
    },
  },
  {
    $lookup: {
      from: 'retailers',
      localField: 'retailer',
      foreignField: '_id',
      as: 'retailer',
    },
  },
  {
    $unwind: {
      path: '$retailer',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'distributors',
      localField: 'distributor',
      foreignField: '_id',
      as: 'distributor',
    },
  },
  {
    $unwind: {
      path: '$distributor',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'created_by',
      foreignField: '_id',
      as: 'user',
    },
  },
  {
    $unwind: {
      path: '$user',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      total_order_value: { $trunc: ['$total_order_value', 2] },
      sku_items: 1,
      invoice_number: 1,
      'retailer.id': '$retailer._id',
      'retailer.name': '$retailer.name',
      'distributor.id': '$distributor._id',
      'distributor.name': '$distributor.name',
      orderTakenBy: '$user.name',
      created_by: 1,
      updated_by: 1,
      note: 1,
      status: 1,
      updatedAt: 1,
      createdAt: 1,
    },
  },
];

module.exports = {
  SECONDARY_ORDERS_AGGREGATE_QUERY,
  SECONDARY_ORDER_AGGREGATE_QUERY,
};
