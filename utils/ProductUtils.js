const buildProductPayload = (product) => {
  let shapedProductPayload = {};
  const { fragranceName } = getFragrenceNameFromCategoryCollection(
    product.category.fragrances,
    product.fragrance
  );

  return (shapedProductPayload = {
    productId: product._id,
    productName: product.productName,
    productCode: product.productCode,
    perCaseQuantity: product.perCaseQuantity,
    categoryName: product.category.categoryName,
    productType: product.category.categoryType,
    brandName: product.category.brandName,
    fragranceName,
  });
};

const buildAllProductsPayload = (products) => {
  return products.reduce((allProducts, product) => {
    return [...allProducts, buildProductPayload(product)];
  }, []);
};

const getFragrenceNameFromCategoryCollection = (fragrences, fragrenceId) => {
  return fragrences.find((fragrence) => {
    return fragrence.fragranceId === fragrenceId;
  });
};

module.exports = {
  buildProductPayload,
  buildAllProductsPayload,
};
