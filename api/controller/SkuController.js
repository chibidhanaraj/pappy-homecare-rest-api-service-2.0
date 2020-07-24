const mongoose = require('mongoose');
const SkuModel = require('../model/SkuModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toSentenceCase, toTitleCase } = require('../../utils/CommonUtils');
const {
  buildSkuPayload,
  buildAllSkusPayload,
} = require('../../helpers/SkuHelper');
const {
  STATUS,
  SKU_CONTROLLER_CONSTANTS,
  PRODUCT_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');

// @desc      Get all sku
// @route     GET /api/sku
exports.getAllSkus = asyncHandler(async (req, res, next) => {
  const fetchedSkus = await SkuModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: SKU_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    skus: await buildAllSkusPayload(fetchedSkus),
  });
});

// @desc      Get sku
// @route     GET /api/sku/:id
exports.getSku = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const fetchedSku = await SkuModel.findById(id).exec();

  if (!fetchedSku) {
    return next(
      new ErrorResponse(
        SKU_CONTROLLER_CONSTANTS.SKU_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: SKU_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    sku: await buildSkuPayload(fetchedSku.toObject()),
  });
});

// @desc      Post sku
// @route     POST /api/sku/
exports.createSku = asyncHandler(async (req, res, next) => {
  const {
    name,
    productId,
    fragranceId,
    quantityId,
    piecesPerCarton,
    mrp,
    sgst,
    cgst,
    igst,
    superStockistMargin,
    distributorMargin,
    retailerMargin,
  } = req.body;

  const skuCode = toTitleCase(name);

  // Check for created sku
  const createdSku = await SkuModel.findOne({
    skuCode,
  });

  if (createdSku) {
    return next(
      new ErrorResponse(
        SKU_CONTROLLER_CONSTANTS.SKU_DUPLICATE_NAME.replace('{{name}}', name),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const sku = new SkuModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    skuCode,
    productId: productId || null,
    fragranceId: fragranceId || null,
    quantityId: quantityId || null,
    piecesPerCarton: piecesPerCarton || 0,
    mrp: mrp || 0,
    sgst: sgst || 0,
    cgst: cgst || 0,
    igst: igst || 0,
    superStockistMargin: superStockistMargin || 0,
    distributorMargin: distributorMargin || 0,
    retailerMargin: retailerMargin || 0,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
  });

  const savedSkuDocument = await sku
    .save()
    .then((doc) => doc.populate('product').execPopulate());

  res.status(201).json({
    status: STATUS.OK,
    message: SKU_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    sku: await buildSkuPayload(savedSkuDocument.toObject()),
  });
});

// @desc      Update sku
// @route     PATCH /api/sku/:id

exports.updateSku = asyncHandler(async (req, res, next) => {
  const skuId = req.params.id;
  const { name } = req.body;
  const reqSkuCode = toTitleCase(name);
  const sku = await SkuModel.findById(skuId).exec();

  if (!sku) {
    return next(
      new ErrorResponse(
        SKU_CONTROLLER_CONSTANTS.SKU_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  if (sku.skuCode !== reqSkuCode) {
    const createdSku = await SkuModel.findOne({
      reqSkuCode,
    });

    if (createdSku) {
      return next(
        new ErrorResponse(
          SKU_CONTROLLER_CONSTANTS.SKU_DUPLICATE_NAME.replace('{{name}}', name),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'productId',
    'fragranceId',
    'quantityId',
    'piecesPerCarton',
    'mrp',
    'sgst',
    'cgst',
    'igst',
    'superStockistMargin',
    'distributorMargin',
    'retailerMargin',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${skuId}`));
  }

  if (name) {
    req.body.name = toSentenceCase(name);
  }

  const dataToUpdate = {
    ...req.body,
    fragranceId: req.body.fragranceId || null,
    quantityId: req.body.quantityId || null,
    skuCode: toSentenceCase(req.body.name),
    updatedBy: req.user.id || '',
  };

  await SkuModel.findOneAndUpdate(
    { _id: skuId },
    dataToUpdate,
    {
      new: true,
      runValidators: true,
      upsert: true,
    },

    async (err, sku) => {
      if (err || !sku) {
        return next(
          new ErrorResponse(
            SKU_CONTROLLER_CONSTANTS.SKU_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }
      res.status(200).json({
        status: STATUS.OK,
        message: SKU_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        sku: await buildSkuPayload(sku.toObject()),
      });
    }
  );
});

// @desc      Update sku
// @route     DELETE /api/sku/:id
exports.deleteSku = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const sku = await SkuModel.findById(id).exec();

  if (!sku) {
    return next(
      new ErrorResponse(
        SKU_CONTROLLER_CONSTANTS.SKU_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await sku.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: SKU_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: '',
    sku: {},
  });
});
