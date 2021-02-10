const SKU_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'parentproducts',
      localField: 'parent_product',
      foreignField: '_id',
      as: 'parent_product',
    },
  },
  {
    $unwind: { path: '$parent_product', preserveNullAndEmptyArrays: true },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      sku: 1,
      name: 1,
      mrp: 1,
      sku_type: 1,
      child: 1,
      special_selling_price: 1,
      parent_product_name: '$parent_product.name',
      pieces_per_carton: 1,
      'tax.sgst': '$sgst',
      'tax.cgst': '$cgst',
      'tax.igst': '$igst',
      'margin.super_stockist': '$super_stockist_margin',
      'margin.distributor': '$distributor_margin',
      'margin.retailer': '$retailer_margin',
    },
  },
];

module.exports = {
  SKU_AGGREGATE_QUERY,
};
