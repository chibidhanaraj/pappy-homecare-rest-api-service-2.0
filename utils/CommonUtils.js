const { upperCase, upperFirst, lowerCase } = require("lodash");

const toUpperCase = (str) => {
  return upperCase(str).replace(/\s/g, "");
};

const toSentenceCase = (str) => {
  return upperFirst(lowerCase(str));
};

const toConstantCase = (str) => {
  return upperCase(str).replace(/\s/g, "_");
};

module.exports = {
  toUpperCase,
  toSentenceCase,
  toConstantCase,
};
