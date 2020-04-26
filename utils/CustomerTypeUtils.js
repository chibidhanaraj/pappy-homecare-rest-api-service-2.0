const customerTypesMargins = (customerTypes) => {
  let customerTypeMargins = {};

  customerTypes.forEach((customerType) => {
    let customerTypeCode = customerType.customerTypeCode;
    switch (customerTypeCode) {
      case "SUPER_STOCKIST":
        Object.assign(customerTypeMargins, {
          superStockistMargin: customerType.marginPercentage,
        });
        break;

      case "DISTRIBUTOR":
        Object.assign(customerTypeMargins, {
          distributorMargin: customerType.marginPercentage,
        });
        break;

      case "WHOLE_SELLER":
        Object.assign(customerTypeMargins, {
          wholeSellerMargin: customerType.marginPercentage,
        });
        break;

      case "RETAILER":
        Object.assign(customerTypeMargins, {
          retailerMargin: customerType.marginPercentage,
        });
        break;
    }
  });
  return customerTypeMargins;
};

module.exports = {
  customerTypesMargins,
};
