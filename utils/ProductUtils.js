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
    category: product.category,
    fragrance: product.fragrance,
    size: product.size,
    mrp: product.mrp,
    gst: product.gst,
    specialPrice: product.specialPrice || "",
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
