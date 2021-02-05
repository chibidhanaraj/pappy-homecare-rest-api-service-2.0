const ParentProductModel = require('./parent-product.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  PARENT_PRODUCT_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const { get } = require('lodash');

// @desc      Get all parent-products
// @route     GET /api/parent-product
exports.getAllParentProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: STATUS.OK,
    message: PARENT_PRODUCT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: res.advancedResults.count,
    pagination: res.advancedResults.pagination,
    parentProducts: res.advancedResults.data,
  });
});

// @desc      Post parent-product
// @route     POST /api/parent-product/
exports.createParentProduct = asyncHandler(async (req, res, next) => {
  const {
    brand,
    name,
    type,
    product_quantity,
    product_quantity_unit,
    pieces_per_carton,
    sgst,
    igst,
    cgst,
    super_stockist_margin,
    distributor_margin,
    retailer_margin,
  } = req.body;

  const existingParentProduct = await ParentProductModel.findOne({
    name: toWordUpperFirstCase(name),
  });

  if (existingParentProduct) {
    return next(
      new ErrorResponse(
        PARENT_PRODUCT_CONTROLLER_CONSTANTS.PARENT_PRODUCT_DUPLICATE_NAME.replace(
          '{{name}}',
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newParentProduct = new ParentProductModel({
    brand,
    name: toWordUpperFirstCase(name),
    type,
    product_quantity,
    product_quantity_unit,
    pieces_per_carton,
    sgst,
    igst,
    cgst,
    super_stockist_margin,
    distributor_margin,
    retailer_margin,
    created_by: get(req, 'user.id', null),
  });

  const savedProductDocument = await newParentProduct.save();

  res.status(201).json({
    status: STATUS.OK,
    message: PARENT_PRODUCT_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    parentProduct: savedProductDocument,
  });
});

// @desc      Update parent-product
// @route     PUT /api/parent-product/:id
exports.updateParentProduct = asyncHandler(async (req, res, next) => {
  const parentProductId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'type',
    'product_quantity',
    'product_quantity_unit',
    'pieces_per_carton',
    'sgst',
    'cgst',
    'igst',
    'super_stockist_margin',
    'distributor_margin',
    'retailer_margin',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${parentProductId}`));
  }

  const parentProduct = await ParentProductModel.findById(
    parentProductId
  ).exec();

  if (!parentProduct) {
    return next(
      new ErrorResponse(
        PARENT_PRODUCT_CONTROLLER_CONSTANTS.PARENT_PRODUCT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const dataToUpdate = {
    ...req.body,
  };

  const updatedParentProduct = await ParentProductModel.findByIdAndUpdate(
    parentProductId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: STATUS.OK,
    message: PARENT_PRODUCT_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
    error: '',
    parentProduct: updatedParentProduct,
  });
});

// @desc      Delete parent-product
// @route     DELETE /api/parent-product/:id
exports.deleteParentProduct = asyncHandler(async (req, res, next) => {
  const parentProductId = req.params.id;

  await ParentProductModel.findOne(
    { _id: parentProductId },
    async (error, parentProduct) => {
      if (error || !parentProduct) {
        return next(
          new ErrorResponse(
            PARENT_PRODUCT_CONTROLLER_CONSTANTS.PARENT_PRODUCT_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      await parentProduct.remove().then(() => {
        res.status(200).json({
          status: STATUS.OK,
          message: PARENT_PRODUCT_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
          error: '',
          parentProduct: {},
        });
      });
    }
  );
});
