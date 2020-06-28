const mongoose = require("mongoose");
const SkuModel = require("../model/SkuModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase } = require("../../utils/CommonUtils");
const {
  buildSkuPayload,
  buildAllSkusPayload,
} = require("../../utils/SkuUtils");

// @desc      Get all sku
// @route     GET /api/sku
exports.getAllSkus = asyncHandler(async (req, res, next) => {
  const fetchedSkus = await SkuModel.find().lean().populate("product").exec();

  res.status(200).json({
    success: true,
    skus: buildAllSkusPayload(fetchedSkus),
  });
});

// @desc      Get sku
// @route     GET /api/sku/:id
exports.getSku = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const fetchedSku = await SkuModel.findById(id).populate("product").exec();

  if (!fetchedSku) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    sku: buildSkuPayload(fetchedSku.toObject()),
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

  const skuCode = toSentenceCase(name);

  // Check for created sku
  const createdSku = await SkuModel.findOne({
    skuCode,
  });

  if (createdSku) {
    return next(
      new ErrorResponse(`The sku ${skuCode} has already been created`, 400)
    );
  }

  const sku = new SkuModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    skuCode,
    product: productId,
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
  });

  const savedSkuDocument = await sku.save();

  res.status(201).json({
    success: true,
    sku: savedSkuDocument,
  });
});

// @desc      Update sku
// @route     PATCH /api/sku/:id

exports.updateSku = asyncHandler(async (req, res, next) => {
  const skuId = req.params.id;
  const { name } = req.body;
  const reqSkuCode = toSentenceCase(name);
  const sku = await SkuModel.findById(skuId).exec();

  if (!sku) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${skuId}`, 404)
    );
  }

  if (sku.skuCode !== reqSkuCode) {
    const createdSku = await SkuModel.findOne({
      reqSkuCode,
    });

    if (createdSku) {
      return next(
        new ErrorResponse(`Sku Name Already exists: ${reqSkuCode}`, 400)
      );
    }
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "name",
    "productId",
    "fragranceId",
    "quantityId",
    "piecesPerCarton",
    "mrp",
    "sgst",
    "cgst",
    "igst",
    "superStockistMargin",
    "distributorMargin",
    "retailerMargin",
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
    skuCode: toSentenceCase(req.body.name),
  };

  const updatedSku = await SkuModel.findByIdAndUpdate(skuId, dataToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, sku: updatedSku });
});

// @desc      Update sku
// @route     DELETE /api/sku/:id
exports.deleteSku = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const sku = await SkuModel.findById(id).exec();

  if (!sku) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }
  await sku.remove();

  res.status(200).json({
    success: true,
    sku: {},
  });
});
