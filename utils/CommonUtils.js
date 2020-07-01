const mongoose = require("mongoose");
const {
  upperCase,
  upperFirst,
  lowerCase,
  isEqual,
  startCase,
  camelCase,
} = require("lodash");

const toUpperCase = (str) => {
  return upperCase(str).replace(/\s/g, "");
};

const toSentenceCase = (str) => {
  return upperFirst(lowerCase(str));
};

const toTitleCase = (str) => {
  return startCase(camelCase(str));
};

const toConstantCase = (str) => {
  return upperCase(str).replace(/\s/g, "_");
};

const areObjectIdEqualArrays = (array1, array2) => {
  array1 = array1.map((element) => mongoose.Types.ObjectId(element)).sort();
  array2 = array2.map((element) => mongoose.Types.ObjectId(element)).sort();
  return isEqual(array1, array2);
};

module.exports = {
  toUpperCase,
  toSentenceCase,
  toConstantCase,
  areObjectIdEqualArrays,
  toTitleCase,
};
