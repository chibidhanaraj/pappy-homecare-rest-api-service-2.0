const mongoose = require("mongoose");
const CustomerModel = require("../model/CustomerModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase, toConstantCase } = require("../../utils/CommonUtils");

// @desc      Get all Customer types
// @route     GET /api/customer/
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await CustomerModel.find().exec();

  res.status(200).json({
    success: true,
    customers,
  });
});

// @desc      Post Customer Type
// @route     POST /api/customer/
exports.createCustomer = asyncHandler(async (req, res, next) => {
  const customerName = toSentenceCase(req.body.customerName);
  const distributionType = req.body.distributionType;
  const contact = req.body.contact;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const customerBeatAreas = req.body.customerBeatAreas;

  // Check for created zone
  const createdCustomer = await CustomerModel.findOne({
    gstNumber,
    customerName,
  });

  if (createdCustomer) {
    return next(
      new ErrorResponse(
        `'${customerName}' with id:${createdCustomer._id} has already been created`,
        400
      )
    );
  }

  const customer = new CustomerModel({
    _id: new mongoose.Types.ObjectId(),
    customerName,
    distributionType,
    contact,
    address,
    gstNumber,
    customerBeatAreas,
  });

  const savedDocument = await customer.save();
  res.status(201).json({
    success: true,
    customer: {
      _id: savedDocument._id,
      customer: savedDocument,
    },
  });
});

// @desc      Update Customer
// @route     PUT /api/customer/
exports.updateCustomer = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const customerBeatAreas = req.body.customerBeatAreas;

  const addCustomerBeatAreas = async () => {
    return await CustomerModel.findOneAndUpdate(
      { _id: id },
      { $addToSet: { customerBeatAreas: { $each: customerBeatAreas } } },
      { new: true }
    );
  };

  const updateIdsToBeatAreaModel = async () => {
    return await BeatAreaModel.updateMany(
      { _id: { $in: customerBeatAreas } },
      { $addToSet: { assignedCustomers: id } },
      { multi: true }
    );
  };

  Promise.all([addCustomerBeatAreas(), updateIdsToBeatAreaModel()]);
  res.status(200).json({ success: true });
});

// @desc      Delete Customer
// @route     delete /api/customer/
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const customer = await CustomerModel.findById(id).exec();

  if (!customer) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const deleteCustomer = async () => {
    return await CustomerModel.findByIdAndRemove(id).exec();
  };

  const removeCustomerIdFromBeatAreas = async () => {
    return await BeatAreaModel.updateMany(
      { assignedCustomers: id },
      { $pull: { assignedCustomers: id } },
      { multi: true }
    );
  };

  Promise.all([deleteCustomer(), removeCustomerIdFromBeatAreas()]);

  res.status(200).json({
    success: true,
    customer: {},
  });
});
