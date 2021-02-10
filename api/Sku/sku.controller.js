const mongoose = require('mongoose');
const SkuModel = require('./sku.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  SKU_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { SKU_AGGREGATE_QUERY } = require('./sku.utils');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const { get } = require('lodash');

// @desc      Get all skus
// @route     GET /api/sku
exports.getAllSkus = asyncHandler(async (req, res, next) => {
  const matchQuery = {};

  if (req.query.parent_product) {
    matchQuery.parent_product = mongoose.Types.ObjectId(
      req.query.parent_product
    );
  }

  const query = [
    {
      $match: matchQuery,
    },
    ...SKU_AGGREGATE_QUERY,
    { $sort: { sku: 1 } },
  ];

  const results = await SkuModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: SKU_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    skus: results,
  });
});

// @desc      Post sku
// @route     POST /api/sku
exports.createSku = asyncHandler(async (req, res, next) => {
  const {
    sku,
    name,
    mrp,
    sku_type,
    pieces_per_carton,
    sgst,
    igst,
    cgst,
    super_stockist_margin,
    distributor_margin,
    retailer_margin,
    child,
  } = req.body;

  const existingSku = await SkuModel.findOne({
    sku,
  });

  if (existingSku) {
    return next(
      new ErrorResponse(
        SKU_CONTROLLER_CONSTANTS.SKU_DUPLICATE_NUMBER.replace('{{name}}', sku),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newSku = new SkuModel({
    sku,
    name: toWordUpperFirstCase(name),
    mrp,
    sku_type,
    pieces_per_carton,
    sgst,
    igst,
    cgst,
    parent_product: get(req, 'body.parent_product', null),
    special_selling_price: req.body.special_selling_price || '',
    super_stockist_margin,
    distributor_margin,
    retailer_margin,
    child,
    created_by: get(req, 'user.id', null),
  });

  const savedSkuDocument = await newSku.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedSkuDocument.id),
      },
    },
    ...SKU_AGGREGATE_QUERY,
  ];

  const createdSku = await SkuModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: SKU_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    sku: createdSku[0],
  });
});

// @desc      Update sku
// @route     PUT /api/sku/:id
exports.updateSku = asyncHandler(async (req, res, next) => {
  const skuId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'sku',
    'name',
    'mrp',
    'sku_type',
    'pieces_per_carton',
    'sgst',
    'igst',
    'cgst',
    'parent_product',
    'special_selling_price',
    'super_stockist_margin',
    'distributor_margin',
    'retailer_margin',
    'child',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${skuId}`));
  }

  const existingSku = await SkuModel.findById(skuId).exec();

  if (!existingSku) {
    return next(
      new ErrorResponse(
        SKU_CONTROLLER_CONSTANTS.SKU_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  if (req.body.sku) {
    const existingSkuWithSameSku = await SkuModel.findOne({
      sku: req.body.sku,
    }).exec();

    if (existingSkuWithSameSku) {
      return next(
        new ErrorResponse(
          SKU_CONTROLLER_CONSTANTS.SKU_DUPLICATE_NUMBER.replace(
            '{{name}}',
            req.body.sku
          ),
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
  };

  await SkuModel.findByIdAndUpdate(skuId, dataToUpdate, {
    new: true,
    runValidators: true,
  });

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(skuId),
      },
    },
    ...SKU_AGGREGATE_QUERY,
  ];

  const updatedSku = await SkuModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: SKU_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
    error: '',
    sku: updatedSku[0],
  });
});

// @desc      Delete sku
// @route     DELETE /api/sku/:id
exports.deleteSku = asyncHandler(async (req, res, next) => {
  const skuId = req.params.id;

  await SkuModel.findOne({ _id: skuId }, async (error, sku) => {
    if (error || !sku) {
      return next(
        new ErrorResponse(
          SKU_CONTROLLER_CONSTANTS.SKU_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    await sku.remove().then(() => {
      res.status(200).json({
        status: STATUS.OK,
        message: SKU_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        sku: {},
      });
    });
  });
});
