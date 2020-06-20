const mongoose = require("mongoose");
const CategoryModel = require("../model/CategoryModel");
const ProductModel = require("../model/ProductModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const {
  getAllCategoriesCodeNames,
  updateCategoryFragranceProperty,
  updateCategorySizeProperty,
  updateProductsWithFragranceProperty,
  updateProductsWithSizeProperty,
  deleteCategoryFragranceProperty,
  deleteProductsWithFragranceProperty,
  deleteCategorySizeProperty,
  deleteProductsWithSizeProperty,
} = require("../../utils/CategoryUtils");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all categories
// @route     GET /api/category
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await CategoryModel.find().exec();
  const categoriesCodeNames = await getAllCategoriesCodeNames(categories);
  res.status(200).json({
    success: true,
    categoriesCodeNames,
    categories,
  });
});

// @desc      Get category
// @route     GET /api/category/:id
exports.getCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id).exec();
  if (!category) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    category,
  });
});

// @desc      Post category
// @route     POST /api/category/
exports.createCategory = asyncHandler(async (req, res, next) => {
  const categoryName = toSentenceCase(req.body.categoryName);
  const categoryCode = toUpperCase(categoryName);

  const category = new CategoryModel({
    _id: new mongoose.Types.ObjectId(),
    brandName: req.body.brandName,
    categoryName,
    categoryCode,
    categoryType: req.body.categoryType,
    fragrances: req.body.fragrances,
    quantities: req.body.quantities,
  });

  const createdCategory = await CategoryModel.findOne({
    categoryCode: category.categoryCode,
  });

  if (createdCategory) {
    return next(
      new ErrorResponse(
        `The category ${category.categoryName} has already been created`,
        400
      )
    );
  }

  const savedCategoryDocument = await category.save();
  res.status(201).json({
    success: true,
    category: savedCategoryDocument,
  });
});

// @desc      Update category
// @route     PUT /api/category/
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;
  const reqCategoryCode = toUpperCase(req.body.categoryName);
  const category = await CategoryModel.findById(categoryId).exec();

  if (!category) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${categoryId}`,
        404
      )
    );
  }

  if (category.categoryCode !== reqCategoryCode) {
    const createdCategory = await CategoryModel.findOne({
      reqCategoryCode,
    });

    if (createdCategory) {
      return next(
        new ErrorResponse(
          `Category Name Already exists: ${reqCategoryCode}`,
          400
        )
      );
    }
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "brandName",
    "categoryName",
    "categoryType",
    "fragrances",
    "quantities",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${categoryId}`));
  }

  if (req.body.categoryName) {
    req.body.categoryName = toSentenceCase(req.body.categoryName);
  }

  const dataToUpdate = {
    ...req.body,
    categoryCode: toUpperCase(req.body.categoryName),
    fragrances: req.body.fragrances,
    quantites: req.body.quantites,
  };

  const updatedCategory = await CategoryModel.findByIdAndUpdate(
    categoryId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, category: updatedCategory });
});

// @desc      Update category properties
// @route     PUT /api/category/:category/update
exports.updateCategoryProperties = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const fragrance = req.body.fragrance;
  const size = req.body.size;

  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  if (fragrance && Object.keys(fragrance).length > 0) {
    await updateCategoryFragranceProperty(
      id,
      fragrance._id,
      fragrance.fragranceName
    );

    await updateProductsWithFragranceProperty(
      id,
      fragrance._id,
      fragrance.fragranceName
    );
  } else if (size && Object.keys(size).length > 0) {
    await updateCategorySizeProperty(id, size._id, size.sizeValue);
    await updateProductsWithSizeProperty(id, size._id, size.sizeValue);
  }

  res.status(200).json({ success: true });
});

// @desc      Delete category
// @route     DELETE /api/category/
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await category.remove();

  res.status(200).json({
    success: true,
    category: {},
  });
});

// @desc      delete category properties
// @route     DELETE /api/category/:category/update
exports.deleteCategoryProperties = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const fragrance = req.body.fragrance;
  const size = req.body.size;

  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  if (fragrance && Object.keys(fragrance).length > 0) {
    await deleteCategoryFragranceProperty(id, fragrance._id);
    await deleteProductsWithFragranceProperty(id, fragrance._id);
  } else if (size && Object.keys(size).length > 0) {
    await deleteCategorySizeProperty(id, size._id);
    await deleteProductsWithSizeProperty(id, size._id);
  }

  res.status(200).json({ success: true });
});
