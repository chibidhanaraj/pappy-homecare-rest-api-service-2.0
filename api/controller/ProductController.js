const mongoose = require("mongoose");
const ProductModel = require("../model/ProductModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");

// @desc      Get all product
// @route     GET /api/product
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await ProductModel.find()
    .select("productName productCode perCaseQuantity _id categoryId")
    .exec();
  res.status(200).json({
    success: true,
    products,
  });
});

// @desc      Get product
// @route     GET /api/product/:id
exports.getProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const product = await ProductModel.findById(id)
    .select("productName productCode perCaseQuantity _id categoryId")
    .exec();
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
  const product = new ProductModel({
    _id: new mongoose.Types.ObjectId(),
    productName: req.body.productName,
    productCode: req.body.productCode,
    perCaseQuantity: req.body.perCaseQuantity,
    categoryId: req.body.categoryId,
  });
  const savedDocument = await product.save();
  res.status(201).json({
    success: true,
    product: {
      _id: savedDocument._id,
      productName: savedDocument.productName,
      productCode: savedDocument.productCode,
      perCaseQuantity: savedDocument.perCaseQuantity,
      categoryId: savedDocument.categoryId,
    },
  });
});

// @desc      Update product
// @route     PUT /api/product/:id
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await ProductModel.findById(id).exec();

  if (!product) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const updatedProduct = await ProductModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).select("productName productCode perCaseQuantity _id categoryId");
  res.status(200).json({ success: true, product: updatedProduct });
});

// @desc      Update product
// @route     DELETE /api/product/:id
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await CategoryModel.findById(id).exec();

  if (!product) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }
  await ProductModel.findByIdAndRemove(id).exec();
  res.status(200).json({
    success: true,
    product: {},
  });
});
