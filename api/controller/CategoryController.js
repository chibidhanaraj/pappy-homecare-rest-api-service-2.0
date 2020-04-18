const mongoose = require("mongoose");
const CategoryModel = require("../model/CategoryModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { getAllCategoriesCodeNames } = require("../../utils/CategoryUtils");

// @desc      Get all categories
// @route     GET /api/category
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await CategoryModel.find()
    .select(
      "brandName categoryName categoryCode categoryType fragrances volumesInLitres weightInKgs _id"
    )
    .exec();
  const categoriesCodeNames = await getAllCategoriesCodeNames(categories);
  res.status(200).json({
    success: true,
    count: categories.length,
    categoriesCodeNames,
    categories,
  });
});

// @desc      Get category
// @route     GET /api/category/:id
exports.getCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const category = await CategoryModel.findById(id)
    .select(
      "brandName categoryName categoryCode categoryType fragrances volumesInLitres weightInKgs _id"
    )
    .exec();
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
  const category = new CategoryModel({
    _id: new mongoose.Types.ObjectId(),
    brandName: req.body.brandName,
    categoryName: req.body.categoryName,
    categoryCode: req.body.categoryCode,
    categoryType: req.body.categoryType,
    fragrances: req.body.fragrances,
    volumesInLitres: req.body.volumesInLitres,
    weightInKgs: req.body.weightInKgs,
  });

  // Check for created category
  const createdCategory = await CategoryModel.findOne({
    categoryCode: req.body.categoryCode,
  });

  if (createdCategory) {
    return next(
      new ErrorResponse(
        `The category ${req.body.categoryCode} has already been created`,
        400
      )
    );
  }

  const savedDocument = await category.save();
  res.status(201).json({
    success: true,
    category: {
      _id: savedDocument._id,
      brandName: req.body.brandName,
      categoryName: savedDocument.categoryName,
      categoryCode: savedDocument.categoryCode,
      categoryType: req.body.categoryType,
      fragrances: savedDocument.fragrances,
      volumesInLitres: savedDocument.volumesInLitres,
      weightInKgs: req.body.weightInKgs,
    },
  });
});

// @desc      Update category
// @route     PUT /api/category/
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const updatedCategory = await CategoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).select(
    "brandName categoryName categoryCode categoryType fragrances volumesInLitres weightInKgs _id"
  );
  res.status(200).json({ success: true, category: updatedCategory });
});

// @desc      Update category
// @route     DELETE /api/category/
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }
  await CategoryModel.findByIdAndRemove(id).exec();
  res.status(200).json({
    success: true,
    category: {},
  });
});
