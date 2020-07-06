const STATUS = {
  OK: "OK",
  ERROR: "ERROR",
};

const ZONE_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Zone Created Successfully",
  UPDATE_SUCCESS: "Zone Updated Successfully",
  DELETE_SUCCESS: "Zone Deleted Successfully",
  ZONE_NOT_FOUND:
    "This Zone does not exist in the server. This  Zone may be deleted before",
  ZONE_DUPLICATE_NAME:
    "{{name}} already exists. Please try again with a different zone name",
};

const DISTRICT_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "District Created Successfully",
  UPDATE_SUCCESS: "District Updated Successfully",
  DELETE_SUCCESS: "District Deleted Successfully",
  DISTRICT_NOT_FOUND:
    "This District does not exist in the server. This District or the district's Zone may be deleted before",
  DISTRICT_DUPLICATE_NAME:
    "{{name}} already exists. Please try again with a different district name",
};

const AREA_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Area Created Successfully",
  UPDATE_SUCCESS: "Area Updated Successfully",
  DELETE_SUCCESS: "Area Deleted Successfully",
  AREA_NOT_FOUND:
    "This Area does not exist in the server. This Area or the area's District or the area's Zone may be deleted before",
  AREA_DUPLICATE_NAME:
    "{{name}} already exists. Please try again with a different area name",
};

const BEAT_AREA_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Beat Created Successfully",
  UPDATE_SUCCESS: "Beat Updated Successfully",
  DELETE_SUCCESS: "Beat Deleted Successfully",
  BEAT_AREA_NOT_FOUND:
    "This Beat does not exist in the server. This Beat or the beat's Area or the beat's District or the beat's Zone may be deleted before",
  BEAT_AREA_DUPLICATE_NAME:
    "{{name}} already exists. Please try again with a different beat name",
};

const SUPER_STOCKIST_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Super Stockist Created Successfully",
  UPDATE_SUCCESS: "Super Stockist Updated Successfully",
  DELETE_SUCCESS: "Super Stockist Deleted Successfully",
  SUPER_STOCKIST_NOT_FOUND:
    "This SuperStockist does not exist in the server. This SuperStockist may be deleted before",
};

const DISTRIBUTOR_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Distributor Created Successfully",
  UPDATE_SUCCESS: "Distributor Updated Successfully",
  DELETE_SUCCESS: "Distributor Deleted Successfully",
  DISTRIBUTOR_NOT_FOUND:
    "This Distributor does not exist in the server. This Distributor may be deleted before",
};

const RETAILER_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Retailer Created Successfully",
  UPDATE_SUCCESS: "Retailer Updated Successfully",
  DELETE_SUCCESS: "Retailer Deleted Successfully",
  RETAILER_NOT_FOUND:
    "This Retailer does not exist in the server. This Retailer may be deleted before",
};

const PRODUCT_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Product Created Successfully",
  UPDATE_SUCCESS: "Product Updated Successfully",
  DELETE_SUCCESS: "Product Deleted Successfully",
  PRODUCT_NOT_FOUND:
    "This Product does not exist in the server. This Product may be deleted before",
  PRODUCT_DUPLICATE_NAME:
    "{{name}} already exists. Please try again with a different product name",
};

const SKU_CONTROLLER_CONSTANTS = {
  FETCH_SUCCESS: "Fetched Successfully",
  CREATE_SUCCESS: "Sku Created Successfully",
  UPDATE_SUCCESS: "Sku Updated Successfully",
  DELETE_SUCCESS: "Sku Deleted Successfully",
  SKU_NOT_FOUND:
    "This Sku does not exist in the server. This Sku may be deleted before",
  SKU_DUPLICATE_NAME:
    "{{name}} already exists. Please try again with a different sku name",
};

module.exports = {
  STATUS,
  ZONE_CONTROLLER_CONSTANTS,
  DISTRICT_CONTROLLER_CONSTANTS,
  AREA_CONTROLLER_CONSTANTS,
  BEAT_AREA_CONTROLLER_CONSTANTS,
  SUPER_STOCKIST_CONTROLLER_CONSTANTS,
  DISTRIBUTOR_CONTROLLER_CONSTANTS,
  RETAILER_CONTROLLER_CONSTANTS,
  PRODUCT_CONTROLLER_CONSTANTS,
  SKU_CONTROLLER_CONSTANTS,
};