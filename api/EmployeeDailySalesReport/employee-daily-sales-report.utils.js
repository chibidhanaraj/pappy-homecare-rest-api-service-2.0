const EMPLOYEE_DAILY_SALES_REPORT_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'secondaryorders',
      localField: 'secondary_order',
      foreignField: '_id',
      as: 'secondary_order',
    },
  },
  {
    $unwind: {
      path: '$secondary_order',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'secondaryorderskuitems',
      localField: 'secondary_order.sku_items',
      foreignField: '_id',
      as: 'sku_items',
    },
  },
  {
    $unwind: {
      path: '$sku_items',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      id: '$_id',
      'sku_item.id': '$sku_items._id',
      'sku_item.ordered_quantity': '$sku_items.ordered_quantity',
      'sku_item.final_quantity': '$sku_items.final_quantity',
      'sku_item.total_cost': '$sku_items.total_cost',
      secondary_order: 1,
      activity: 1,
      retail_visit: 1,
      createdAt: 1,
      location: 1,
      retailer: 1,
      employee: 1,
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
      total_ordered_quantities: {
        $sum: { $toInt: '$sku_item.ordered_quantity' },
      },
      retail_visit: {
        $first: '$retail_visit',
      },
      secondary_order: {
        $first: '$secondary_order',
      },
      employee: {
        $first: '$employee',
      },
      activity: {
        $first: '$activity',
      },
      retailer: {
        $first: '$retailer',
      },
      createdAt: {
        $first: '$createdAt',
      },
      location: {
        $first: '$location',
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
    $project: {
      id: '$_id',
      _id: 0,
      secondary_order: {
        $cond: [
          { $gt: ['$total_order_value', 0] },
          {
            id: '$secondary_order._id',
            invoice_number: '$secondary_order.invoice_number',
            total_order_value: '$total_order_value',
            total_ordered_quantities: '$total_ordered_quantities',
          },
          '$$REMOVE',
        ],
      },
      'retailer.id': '$retailer._id',
      'retailer.name': '$retailer.name',
      'beat.id': '$beat._id',
      'beat.name': '$beat.name',
      activity: 1,
      retail_visit: 1,
      createdAt: 1,
      location: 1,
      employee: 1,
    },
  },
  {
    $sort: {
      createdAt: 1,
    },
  },
];

module.exports = {
  EMPLOYEE_DAILY_SALES_REPORT_AGGREGATE_QUERY,
};
