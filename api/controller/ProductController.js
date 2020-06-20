const mongoose = require("mongoose");
const ProductModel = require("../model/ProductModel");
const CustomerTypeModel = require("../model/CustomerTypeModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const {
  buildAllProductsPayload,
  buildProductPayload,
} = require("../../utils/ProductUtils");

const { toUpperCase } = require("../../utils/CommonUtils");

// @desc      Get all product
// @route     GET /api/product
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const fetchedProducts = await ProductModel.find().populate("category").exec();

  res.status(200).json({
    success: true,
    products: fetchedProducts,
  });
});

// @desc      Get product
// @route     GET /api/product/:id
exports.getProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const fetchedProduct = await ProductModel.findById(id)
    .populate("category")
    .exec();

  if (!fetchedProduct) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    product: fetchedProduct,
  });
});

// @desc      Post product
// @route     POST /api/product/
exports.createProduct = asyncHandler(async (req, res, next) => {
  const productName = req.body.productName;
  const productCode = toUpperCase(productName);

  // Check for created product
  const createdProduct = await ProductModel.findOne({
    productCode: productCode,
  });

  if (createdProduct) {
    return next(
      new ErrorResponse(
        `The category ${productCode} has already been created`,
        400
      )
    );
  }

  const product = new ProductModel({
    _id: new mongoose.Types.ObjectId(),
    productName,
    productCode,
    category: req.body.categoryId,
    fragranceId: req.body.fragranceId,
    quantityId: req.body.quantityId,
    perCaseQuantity: req.body.perCaseQuantity,
    mrp: req.body.mrp,
    gst: req.body.gst,
  });

  const savedProductDocument = await product.save();

  console.log(savedProductDocument);

  res.status(201).json({
    success: true,
    product: savedProductDocument,
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
  }).populate("category");

  const customerTypes = await CustomerTypeModel.find().exec();
  const productPayload = buildProductPayload(updatedProduct, customerTypes);

  res.status(200).json({ success: true, product: productPayload });
});

// @desc      Update product
// @route     DELETE /api/product/:id
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await ProductModel.findById(id).exec();

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
