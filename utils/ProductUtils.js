const { distributionTypesPrices } = require("./PriceCalculationUtils");

const buildProductPayload = (product, customerTypes) => {
  const billingPrices = distributionTypesPrices(
    customerTypes,
    product.mrp,
    product.gst,
    product.specialPrice
  );

  return {
    productId: product._id,
    productName: product.productName,
    productCode: product.productCode,
    perCaseQuantity: product.perCaseQuantity,
    categoryName: product.category.categoryName,
    productType: product.category.categoryType,
    brandName: product.category.brandName,
    mrp: product.mrp,
    gst: product.gst,
    specialPrice: product.specialPrice,
    billingPrices,
  };
};

const buildAllProductsPayload = (products, customerTypes) => {
  return products.reduce((allProducts, product) => {
    return [...allProducts, buildProductPayload(product, customerTypes)];
  }, []);
};

module.exports = {
  buildProductPayload,
  buildAllProductsPayload,
};
