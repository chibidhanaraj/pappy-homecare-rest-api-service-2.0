const mongoose = require("mongoose");
const CustomerModel = require("../model/CustomerModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all Customer types
// @route     GET /api/customer/
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await CustomerModel.find().exec();

  res.status(200).json({
    success: true,
    customers,
  });
});

// @desc      Get Customer
// @route     GET /api/customer/:customerId
exports.getCustomer = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const customer = await CustomerModel.findById(id).select("-__v").exec();

  if (!customer) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    customer,
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
  const customerName = toSentenceCase(req.body.customerName);
  const distributionType = req.body.distributionType;
  const contact = req.body.contact;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const customerBeatAreas = req.body.customerBeatAreas;

  const customer = await CustomerModel.findById(id).exec();
  if (!customer) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    customerName,
    distributionType,
    contact,
    address,
    gstNumber,
  };

  const updateCustomerModel = () => {
    return CustomerModel.findByIdAndUpdate(
      id,
      dataToUpdate,
      {
        new: true,
        runValidators: true,
      },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not update the customer id - ${customer._id}`,
              404
            )
          );
        }
      }
    );
  };

  const addCustomerBeatAreas = () => {
    return CustomerModel.findOneAndUpdate(
      { _id: id },
      { $addToSet: { customerBeatAreas: { $each: customerBeatAreas } } },
      { new: true },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not add the Beat Area Ids to the customer id - ${customer._id}`,
              404
            )
          );
        }
      }
    );
  };

  const updateCustomerIdToBeatAreas = () => {
    return BeatAreaModel.updateMany(
      { _id: { $in: customerBeatAreas } },
      { $addToSet: { assignedCustomers: id } },
      { multi: true },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not add the customer id - ${customer._id} to Beat Areas`,
              404
            )
          );
        }
      }
    );
  };

  if (req.body.customerBeatAreas) {
    Promise.all([
      await addCustomerBeatAreas(),
      await updateCustomerIdToBeatAreas(),
    ]);
    res.status(200).json({ success: true });
  } else {
    const updatedCustomerDetails = await updateCustomerModel();
    res.status(200).json({ success: true, customer: updatedCustomerDetails });
  }
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

  const deleteCustomer = () => {
    return CustomerModel.findByIdAndRemove(id).exec();
  };

  const removeCustomerIdFromBeatAreas = () => {
    return BeatAreaModel.updateMany(
      { assignedCustomers: id },
      { $pull: { assignedCustomers: id } },
      { multi: true },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not remove the customer id - ${customer._id} from Beat Areas`,
              404
            )
          );
        }
      }
    );
  };

  Promise.all([await deleteCustomer(), await removeCustomerIdFromBeatAreas()]);

  res.status(200).json({
    success: true,
    customer: {},
  });
});
