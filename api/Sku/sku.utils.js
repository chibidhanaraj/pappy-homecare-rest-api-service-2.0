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
      sku_number: 1,
      fragrance_name: 1,
      mrp: 1,
      type: 1,
      child: 1,
      special_selling_price: 1,
      name: '$parent_product.name',
      brand: '$parent_product.brand',
      product_quantity: '$parent_product.product_quantity',
      product_quantity_unit: '$parent_product.product_quantity_unit',
      pieces_per_carton: '$parent_product.pieces_per_carton',
      'tax.sgst': '$parent_product.sgst',
      'tax.cgst': '$parent_product.cgst',
      'tax.igst': '$parent_product.igst',
      'margin.super_stockist': '$parent_product.super_stockist_margin',
      'margin.distributor': '$parent_product.distributor_margin',
      'margin.retailer': '$parent_product.retailer_margin',
    },
  },
];

module.exports = {
  SKU_AGGREGATE_QUERY,
};
