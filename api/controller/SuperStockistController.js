const mongoose = require("mongoose");
const SuperStockistModel = require("../model/SuperStockistModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase } = require("../../utils/CommonUtils");

// @desc GET Super Stockists
// @route GET /api/superstockist
exports.getAllSuperStockists = asyncHandler(async (req, res, next) => {
  const superStockists = await SuperStockistModel.find().exec();

  res.status(200).json({
    success: true,
    superStockists,
  });
});

// @desc      Get Super Stockist
// @route     GET /api/superstockist/:superstockistId
exports.getSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;
  const superStockist = await SuperStockistModel.findById(
    superStockistId
  ).exec();

  if (!superStockist) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${superStockistId}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    superStockist,
  });
});

// @desc      Post Super Stockist
// @route     POST /api/superstockist/
exports.createSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistName = toSentenceCase(req.body.superStockistName);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const existingDistributorsCount = req.body.existingDistributorsCount;
  const currentBrandsDealing = req.body.currentBrandsDealing;

  // Check for Already existing superStockist with GST number
  const findSuperStockist = await SuperStockistModel.findOne({
    gstNumber,
  });

  if (findSuperStockist) {
    return next(
      new ErrorResponse(
        `Super Stockist already exists with GST Number: ${gstNumber}`,
        400
      )
    );
  }

  const superStockist = new SuperStockistModel({
    _id: new mongoose.Types.ObjectId(),
    superStockistName,
    contact,
    additionalContacts,
    address,
    gstNumber,
    existingDistributorsCount,
    currentBrandsDealing,
  });

  const savedSuperStockistDocument = await superStockist.save();
  res.status(201).json({
    success: true,
    superStockist: savedSuperStockistDocument,
  });
});

// @desc      Delete Super Stockist
// @route     delete /api/superstockist/:superstockistId
exports.deleteSuperStockist = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const superStockist = await SuperStockistModel.findById(id).exec();

  if (!superStockist) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await SuperStockistModel.findByIdAndRemove(id).exec();

  res.status(200).json({
    success: true,
    superStockist: {},
  });
});

// @desc      Update Super Stockist
// @route     PATCH /api/superstockist/:superstockistId
exports.updateSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;

  const superStockist = await SuperStockistModel.findById(
    superStockistId
  ).exec();

  if (!superStockist) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${superStockistId}`,
        404
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "superStockistName",
    "contact",
    "additionalContacts",
    "address",
    "gstNumber",
    "existingDistributorsCount",
    "currentBrandsDealing",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${superStockistId}`));
  }

  if (req.body.superStockistName) {
    req.body.superStockistName = toSentenceCase(req.body.superStockistName);
  }

  const reqGstNumber = req.body.gstNumber;
  // Check for duplicates
  if (reqGstNumber && reqGstNumber !== superStockist.gstNumber) {
    const createdSuperStockist = await SuperStockistModel.findOne({
      reqGstNumber,
    });

    if (createdSuperStockist) {
      return next(
        new ErrorResponse(
          `Super Stockist with same GST number ${reqGstNumber} already exists`,
          400
        )
      );
    }
  }

  const updatedSuperStockist = await SuperStockistModel.findByIdAndUpdate(
    superStockistId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, superStockist: updatedSuperStockist });
});
