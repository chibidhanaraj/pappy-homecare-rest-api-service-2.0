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
  const categories = await CategoryModel.find()
    .select(
      "brandName categoryName categoryCode categoryType fragrances sizes _id"
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
  const category = await CategoryModel.findById(id)
    .select(
      "brandName categoryName categoryCode categoryType fragrances sizes _id"
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
  const categoryName = toSentenceCase(req.body.categoryName);
  const categoryCode = toUpperCase(categoryName);

  const category = new CategoryModel({
    _id: new mongoose.Types.ObjectId(),
    brandName: req.body.brandName,
    categoryName,
    categoryCode,
    categoryType: req.body.categoryType,
    fragrances: req.body.fragrances,
    sizes: req.body.sizes,
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
      sizes: savedDocument.sizes,
    },
  });
});

// @desc      Update category
// @route     PUT /api/category/
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const brandName = req.body.brandName;
  const categoryName = toSentenceCase(req.body.categoryName);
  const categoryCode = toUpperCase(categoryName);
  const categoryType = req.body.categoryType;

  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    brandName,
    categoryName,
    categoryCode,
    categoryType,
    fragrances: req.body.fragrances,
    sizes: req.body.sizes,
  };

  const updatedCategory = await CategoryModel.findByIdAndUpdate(
    id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  ).select(
    "brandName categoryName categoryCode categoryType fragrances sizes _id"
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
  const deleteCategory = (categoryId) => {
    return CategoryModel.findByIdAndRemove(categoryId).exec();
  };

  const deleteProductsWithCategoryId = (categoryId) => {
    return ProductModel.deleteMany(
      { category: categoryId },
      { multi: true },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not delete the products for category Id ${categoryId}`,
              404
            )
          );
        }
      }
    );
  };

  Promise.all([
    await deleteCategory(id),
    await deleteProductsWithCategoryId(id),
  ]);

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
