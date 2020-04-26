const CategoryModel = require("../api/model/CategoryModel");
const ProductModel = require("../api/model/ProductModel");
const ErrorResponse = require("./errorResponse");

const getAllCategoriesCodeNames = (CategoriesList) => {
  return CategoriesList.reduce((categories, category) => {
    return [...categories, category.categoryCode];
  }, []);
};

const updateCategoryFragranceProperty = (
  categoryId,
  fragranceId,
  fragranceName
) => {
  return CategoryModel.findOneAndUpdate(
    { _id: categoryId, "fragrances._id": fragranceId },
    { $set: { "fragrances.$.fragranceName": fragranceName } },
    (error, doc) => {
      if (error || !doc) {
        console.log("Not entry found");
      }
    }
  );
};

const updateCategorySizeProperty = (categoryId, sizeId, sizeValue) => {
  return CategoryModel.findOneAndUpdate(
    { _id: categoryId, "sizes._id": sizeId },
    { $set: { "sizes.$.sizeValue": sizeValue } },
    (error, doc) => {
      if (error) {
        console.log(error);
      }
      console.log(doc);
    }
  );
};

const updateProductsWithFragranceProperty = (
  categoryId,
  fragranceId,
  fragranceName
) => {
  return ProductModel.updateMany(
    { category: categoryId, "fragrance._id": fragranceId },
    { $set: { "fragrance.fragranceName": fragranceName } },
    { multi: true },
    (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not update the products for fragrance id - ${fragranceId} of category Id ${categoryId}`,
            404
          )
        );
      }
    }
  );
};

const updateProductsWithSizeProperty = (categoryId, sizeId, sizeValue) => {
  return ProductModel.updateMany(
    { category: categoryId, "size._id": sizeId },
    { $set: { "size.sizeValue": sizeValue } },
    { multi: true },
    (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not update the products for size id - ${sizeId} of category Id ${categoryId}`,
            404
          )
        );
      }
    }
  );
};

const deleteCategoryFragranceProperty = (categoryId, fragranceId) => {
  return CategoryModel.findOneAndUpdate(
    { _id: categoryId },
    { $pull: { fragrances: { _id: fragranceId } } },
    (error, doc) => {
      if (error || !doc) {
        console.log("Not updated");
      }
    }
  );
};

const deleteProductsWithFragranceProperty = (categoryId, fragranceId) => {
  return ProductModel.deleteMany(
    { "fragrance._id": fragranceId },
    { multi: true },
    (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the products for fragrance id - ${fragranceId} of category Id ${categoryId}`,
            404
          )
        );
      }
    }
  );
};

const deleteCategorySizeProperty = (categoryId, sizeId) => {
  return CategoryModel.findOneAndUpdate(
    { _id: categoryId },
    { $pull: { sizes: { _id: sizeId } } },
    (error, doc) => {
      if (error || !doc) {
        console.log("Not updated");
      }
    }
  );
};

const deleteProductsWithSizeProperty = (categoryId, sizeId) => {
  return ProductModel.deleteMany(
    { "size._id": sizeId },
    { multi: true },
    (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the products for size id - ${sizeId} of category Id ${categoryId}`,
            404
          )
        );
      }
    }
  );
};

module.exports = {
  getAllCategoriesCodeNames,
  updateCategoryFragranceProperty,
  updateProductsWithFragranceProperty,
  updateCategorySizeProperty,
  updateProductsWithSizeProperty,
  deleteCategoryFragranceProperty,
  deleteProductsWithFragranceProperty,
  deleteCategorySizeProperty,
  deleteProductsWithSizeProperty,
};
