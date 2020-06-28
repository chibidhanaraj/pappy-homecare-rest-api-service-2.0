const mongoose = require("mongoose");
const ProductModel = require("../model/ProductModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all products
// @route     GET /api/product
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await ProductModel.find().exec();
  res.status(200).json({
    success: true,
    products,
  });
});

// @desc      Get product
// @route     GET /api/product/:id
exports.getProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await ProductModel.findById(id).exec();
  if (!product) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// @desc      Post product
// @route     POST /api/product/
exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    brandName,
    productName,
    productType,
    fragrances,
    quantities,
  } = req.body;

  const productCode = toUpperCase(productName);

  const product = new ProductModel({
    _id: new mongoose.Types.ObjectId(),
    brandName,
    productName,
    productCode,
    productType,
    fragrances,
    quantities,
  });

  const createdProduct = await ProductModel.findOne({
    productCode: product.productCode,
  });

  if (createdProduct) {
    return next(
      new ErrorResponse(
        `The product ${product.productName} has already been created`,
        400
      )
    );
  }

  const savedProductDocument = await product.save();

  res.status(201).json({
    success: true,
    product: savedProductDocument,
  });
});

// @desc      Update product
// @route     PUT /api/product/
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  const reqProductCode = toUpperCase(req.body.productName);
  const product = await ProductModel.findById(productId).exec();

  if (!product) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${productId}`,
        404
      )
    );
  }

  if (product.productCode !== reqProductCode) {
    const createdProduct = await ProductModel.findOne({
      reqProductCode,
    });

    if (createdProduct) {
      return next(
        new ErrorResponse(`Product Name Already exists: ${reqProductCode}`, 400)
      );
    }
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "brandName",
    "productName",
    "productType",
    "fragrances",
    "quantities",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${productId}`));
  }

  if (req.body.productName) {
    req.body.productName = toSentenceCase(req.body.productName);
  }

  const dataToUpdate = {
    ...req.body,
    productCode: toUpperCase(req.body.productName),
    fragrances: req.body.fragrances,
    quantites: req.body.quantites,
  };

  const updatedProduct = await ProductModel.findByIdAndUpdate(
    productId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, product: updatedProduct });
});

// @desc      Delete product
// @route     DELETE /api/product/
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await ProductModel.findById(id).exec();

  if (!product) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await product.remove();

  res.status(200).json({
    success: true,
    product: {},
  });
});
