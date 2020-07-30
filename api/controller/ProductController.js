const mongoose = require('mongoose');
const ProductModel = require('../model/ProductModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  toUpperCase,
  toSentenceCase,
  areObjectIdEqualArrays,
  findDifferenceIds,
} = require('../../utils/CommonUtils');
const {
  STATUS,
  PRODUCT_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const SkuModel = require('../model/Sku/SkuModel');
const {
  deleteSkusAndCombosOnPropertyUpdate,
  deleteSkusAndCombos,
} = require('../../helpers/ProductHelper');

// @desc      Get all products
// @route     GET /api/product
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await ProductModel.find().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: PRODUCT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
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
      new ErrorResponse(
        PRODUCT_CONTROLLER_CONSTANTS.PRODUCT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: PRODUCT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    product,
  });
});

// @desc      Post product
// @route     POST /api/product/
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { brandName, name, productType, fragrances, quantities } = req.body;

  const productCode = toUpperCase(name);

  const product = new ProductModel({
    _id: new mongoose.Types.ObjectId(),
    brandName,
    name,
    productCode,
    productType,
    fragrances,
    quantities,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
  });

  const createdProduct = await ProductModel.findOne({
    productCode: product.productCode,
  });

  if (createdProduct) {
    return next(
      new ErrorResponse(
        PRODUCT_CONTROLLER_CONSTANTS.PRODUCT_DUPLICATE_NAME.replace(
          '{{name}}',
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const savedProductDocument = await product.save();

  res.status(201).json({
    status: STATUS.OK,
    message: PRODUCT_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    product: savedProductDocument,
  });
});

// @desc      Update product
// @route     PUT /api/product/
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  const reqProductCode = toUpperCase(req.body.name);

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'brandName',
    'name',
    'productType',
    'fragrances',
    'quantities',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${productId}`));
  }

  const product = await ProductModel.findById(productId).exec();

  if (!product) {
    return next(
      new ErrorResponse(
        PRODUCT_CONTROLLER_CONSTANTS.PRODUCT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  if (product.productCode !== reqProductCode) {
    const createdProduct = await ProductModel.findOne({
      reqProductCode,
    });

    if (createdProduct) {
      new ErrorResponse(
        PRODUCT_CONTROLLER_CONSTANTS.PRODUCT_DUPLICATE_NAME.replace(
          '{{name}}',
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      );
    }
  }

  const prevFragrances = product.fragrances
    .map((fragrance) => fragrance._id)
    .filter((id) => !!id);
  const newFragrances = req.body.fragrances
    .map((fragrance) => fragrance._id)
    .filter((id) => !!id);

  if (!areObjectIdEqualArrays(prevFragrances, newFragrances)) {
    const fragranceSkusToBeDeleted = findDifferenceIds(
      prevFragrances,
      newFragrances
    );

    await deleteSkusAndCombosOnPropertyUpdate(
      'fragranceId',
      fragranceSkusToBeDeleted
    );
  }

  const prevQuantities = product.quantities
    .map((quantity) => quantity._id)
    .filter((id) => !!id);
  const newQuantities = req.body.quantities
    .map((quantity) => quantity._id)
    .filter((id) => !!id);

  if (!areObjectIdEqualArrays(prevQuantities, newQuantities)) {
    const quantitySkusToBeDeleted = findDifferenceIds(
      prevQuantities,
      newQuantities
    );

    await deleteSkusAndCombosOnPropertyUpdate(
      'quantityId',
      quantitySkusToBeDeleted
    );
  }

  if (req.body.name) {
    req.body.name = toSentenceCase(req.body.name);
  }

  const dataToUpdate = {
    ...req.body,
    productCode: toUpperCase(req.body.name),
    fragrances: req.body.fragrances,
    quantites: req.body.quantites,
    updatedBy: req.user.id || '',
  };

  const updatedProduct = await ProductModel.findByIdAndUpdate(
    productId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: STATUS.OK,
    message: PRODUCT_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
    error: '',
    product: updatedProduct,
  });
});

// @desc      Delete product
// @route     DELETE /api/product/
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;

  await ProductModel.findOne({ _id: productId }, async (error, product) => {
    if (error || !product) {
      return next(
        new ErrorResponse(
          PRODUCT_CONTROLLER_CONSTANTS.PRODUCT_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    await Promise.all([
      await deleteSkusAndCombos(productId),
      await product.remove(),
    ]).then((el) => {
      res.status(200).json({
        status: STATUS.OK,
        message: PRODUCT_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        product: {},
      });
    });
  });
});
