const mongoose = require("mongoose");
const CustomerTypeModel = require("../model/CustomerTypeModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase, toConstantCase } = require("../../utils/CommonUtils");

// @desc      Get all Customer types
// @route     GET /api/customer/customertype/
exports.getAllCustomerTypes = asyncHandler(async (req, res, next) => {
  const customerTypes = await CustomerTypeModel.find()
    .select("_id customerTypeName customerTypeCode marginPercentage")
    .exec();

  res.status(200).json({
    status: true,
    customerTypes,
  });
});

// @desc      Get Customer Type
// @route     GET /api/customer/customertype/:id
exports.getCustomerType = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const customerType = await CustomerTypeModel.findById(id).select(
    "_id customerTypeName customerTypeCode marginPercentage"
  );

  if (!customerType) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    status: true,
    customerType,
  });
});

// @desc      Post Customer Type
// @route     POST /api/customer/customertype
exports.createCustomerType = asyncHandler(async (req, res, next) => {
  const customerTypeName = toSentenceCase(req.body.customerTypeName);
  const customerTypeCode = toConstantCase(customerTypeName);
  const marginPercentage = req.body.marginPercentage;

  // Check for created customerType
  const createdCustomerType = await CustomerTypeModel.findOne({
    customerTypeCode,
  });

  if (createdCustomerType) {
    return next(
      new ErrorResponse(`'${customerTypeName}' has already been created`, 400)
    );
  }

  const customerType = new CustomerTypeModel({
    _id: new mongoose.Types.ObjectId(),
    customerTypeName,
    customerTypeCode,
    marginPercentage,
  });

  const savedDocument = await customerType.save();
  res.status(201).json({
    status: true,
    customerType: {
      _id: savedDocument._id,
      customerTypeName: savedDocument.customerTypeName,
      customerTypeCode: savedDocument.customerTypeCode,
      marginPercentage: savedDocument.marginPercentage,
    },
  });
});

// @desc      Update Customer Type
// @route     PUT /api/customertype/:id
exports.updateCustomerType = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const customerType = await CustomerTypeModel.findById(id).exec();
  const customerTypeName = toSentenceCase(req.body.customerTypeName);
  const customerTypeCode = toConstantCase(customerTypeName);
  const marginPercentage = Number(req.body.marginPercentage);

  if (!customerType) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    customerTypeName,
    customerTypeCode,
    marginPercentage,
  };

  const updatedCustomerType = await CustomerTypeModel.findByIdAndUpdate(
    id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ status: true, customerType: updatedCustomerType });
});

// @desc      Delete Customer Type
// @route     PUT /api/customer/customertype/:id
exports.deleteCustomerType = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const customerType = await CustomerTypeModel.findByIdAndDelete(id).exec();

  if (!customerType) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    status: true,
    customerType: {},
  });
});
