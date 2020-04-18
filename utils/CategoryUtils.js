const getAllCategoriesCodeNames = (CategoriesList) => {
  return CategoriesList.reduce((categories, category) => {
    return [...categories, category.categoryCode];
  }, []);
};

module.exports = {
  getAllCategoriesCodeNames,
};
