const mongoose = require('mongoose');
const ComboSkuModel = require('../../model/Sku/ComboSkuModel');
const ErrorResponse = require('../../../utils/errorResponse');
const asyncHandler = require('../../../middleware/asyncHandler');
const { toSentenceCase, toTitleCase } = require('../../../utils/CommonUtils');
const { buildComboSkuPayload } = require('../../../helpers/ComboSkuHelper');
const {
  STATUS,
  COMBO_SKU_CONTROLLER_CONSTANTS,
} = require('../../../constants/controller.constants');
const { ERROR_TYPES } = require('../../../constants/error.constant');

// @desc      Get comboSku
// @route     GET /api/comboSku/:id
exports.getComboSku = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const fetchedComboSku = await ComboSkuModel.findById(id).exec();

  if (!fetchedComboSku) {
    return next(
      new ErrorResponse(
        COMBO_SKU_CONTROLLER_CONSTANTS.COMBO_SKU_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: COMBO_SKU_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    sku: await buildComboSkuPayload(fetchedComboSku.toObject()),
  });
});

// @desc      Post comboSku
// @route     POST /api/comboSku/
exports.createComboSku = asyncHandler(async (req, res, next) => {
  const {
    name,
    skus,
    piecesPerCarton,
    mrp,
    sgst,
    cgst,
    igst,
    superStockistMargin,
    distributorMargin,
    retailerMargin,
  } = req.body;

  const comboSkuCode = toTitleCase(name);

  // Check for created comboSku
  const createdComboSku = await ComboSkuModel.findOne({
    comboSkuCode,
  });

  if (createdComboSku) {
    return next(
      new ErrorResponse(
        COMBO_SKU_CONTROLLER_CONSTANTS.COMBO_SKU_DUPLICATE_NAME.replace(
          '{{name}}',
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const comboSku = new ComboSkuModel({
    name,
    comboSkuCode,
    skus,
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

  const savedComboSkuDocument = await comboSku.save();

  res.status(201).json({
    status: STATUS.OK,
    message: COMBO_SKU_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    sku: await buildComboSkuPayload(savedComboSkuDocument.toObject()),
  });
});

// @desc      Update comboSku
// @route     PATCH /api/comboSku/:id

exports.updateComboSku = asyncHandler(async (req, res, next) => {
  const comboSkuId = req.params.id;
  const { name } = req.body;
  const reqComboSkuCode = toTitleCase(name);
  const comboSku = await ComboSkuModel.findById(comboSkuId).exec();

  if (!comboSku) {
    return next(
      new ErrorResponse(
        COMBO_SKU_CONTROLLER_CONSTANTS.COMBO_SKU_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  if (comboSku.comboSkuCode !== reqComboSkuCode) {
    const createdComboSku = await ComboSkuModel.findOne({
      reqComboSkuCode,
    });

    if (createdComboSku) {
      return next(
        new ErrorResponse(
          COMBO_SKU_CONTROLLER_CONSTANTS.COMBO_SKU_DUPLICATE_NAME.replace(
            '{{name}}',
            name
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'skus',
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
    return next(new ErrorResponse(`Invalid Updates for ${comboSkuId}`));
  }

  if (name) {
    req.body.name = toSentenceCase(name);
  }

  const dataToUpdate = {
    ...req.body,
    comboSkuCode: toSentenceCase(req.body.name),
    updatedBy: req.user.id || '',
  };

  await ComboSkuModel.findOneAndUpdate(
    { _id: comboSkuId },
    dataToUpdate,
    {
      new: true,
      runValidators: true,
      upsert: true,
    },

    async (err, comboSku) => {
      if (err || !comboSku) {
        return next(
          new ErrorResponse(
            COMBO_SKU_CONTROLLER_CONSTANTS.COMBO_SKU_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }
      res.status(200).json({
        status: STATUS.OK,
        message: COMBO_SKU_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        sku: await buildComboSkuPayload(comboSku.toObject()),
      });
    }
  );
});

// @desc      Update comboSku
// @route     DELETE /api/comboSku/:id
exports.deleteComboSku = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const comboSku = await ComboSkuModel.findById(id).exec();

  if (!comboSku) {
    return next(
      new ErrorResponse(
        COMBO_SKU_CONTROLLER_CONSTANTS.COMBO_SKU_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await comboSku.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: COMBO_SKU_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: '',
    sku: {},
  });
});
