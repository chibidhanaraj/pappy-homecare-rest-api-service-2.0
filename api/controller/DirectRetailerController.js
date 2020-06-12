const mongoose = require("mongoose");
const DirectRetailerModel = require("../model/DirectRetailerModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase } = require("../../utils/CommonUtils");

// @desc GET Direct Retailer
// @route GET /api/directretailer
exports.getAllDirectRetailers = asyncHandler(async (req, res, next) => {
  const directRetailers = await DirectRetailerModel.find().exec();

  res.status(200).json({
    success: true,
    directRetailers,
  });
});

// @desc      Get Direct Retailer
// @route     GET /api/directretailer/:directRetailerId
exports.getDirectRetailer = asyncHandler(async (req, res, next) => {
  const directRetailerId = req.params.id;
  const directRetailer = await DirectRetailerModel.findById(
    directRetailerId
  ).exec();

  if (!directRetailer) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${directRetailerId}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    directRetailer,
  });
});

// @desc      Post Direct Retailer
// @route     POST /api/directretailer/
exports.createDirectRetailer = asyncHandler(async (req, res, next) => {
  const directRetailerName = toSentenceCase(req.body.directRetailerName);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;

  // Check for Already existing Direct Retailer with GST number
  const findDirectRetailer = await DirectRetailerModel.findOne({
    gstNumber,
  });

  if (findDirectRetailer) {
    return next(
      new ErrorResponse(
        `Direct Retailer already exists with GST Number: ${gstNumber}`,
        400
      )
    );
  }

  const directRetailer = new DirectRetailerModel({
    _id: new mongoose.Types.ObjectId(),
    directRetailerName,
    contact,
    additionalContacts,
    address,
    gstNumber,
  });

  const savedDirectRetailerDocument = await directRetailer.save();
  res.status(201).json({
    success: true,
    directRetailer: savedDirectRetailerDocument,
  });
});

// @desc      Delete Direct Retailer
// @route     delete /api/directretailer/:directRetailerId
exports.deleteDirectRetailer = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const directRetailer = await DirectRetailerModel.findById(id).exec();

  if (!directRetailer) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await DirectRetailerModel.findByIdAndRemove(id).exec();

  res.status(200).json({
    success: true,
    directRetailer: {},
  });
});

// @desc      Update Direct Retailer
// @route     PATCH /api/directretailer/:directRetailerId
exports.updateDirectRetailer = asyncHandler(async (req, res, next) => {
  const directRetailerId = req.params.id;

  const directRetailer = await DirectRetailerModel.findById(
    directRetailerId
  ).exec();

  if (!directRetailer) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${directRetailerId}`,
        404
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "directRetailerName",
    "contact",
    "additionalContacts",
    "address",
    "gstNumber",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${directRetailerId}`));
  }

  if (req.body.directRetailerName) {
    req.body.directRetailerName = toSentenceCase(req.body.directRetailerName);
  }

  const reqGstNumber = req.body.gstNumber;
  // Check for duplicates
  if (reqGstNumber && reqGstNumber !== directRetailer.gstNumber) {
    const createddirectRetailer = await DirectRetailerModel.findOne({
      reqGstNumber,
    });

    if (createddirectRetailer) {
      return next(
        new ErrorResponse(
          `Direct Retailer with same GST number ${reqGstNumber} already exists`,
          400
        )
      );
    }
  }

  const updatedDirectRetailer = await DirectRetailerModel.findByIdAndUpdate(
    directRetailerId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json({ success: true, directRetailer: updatedDirectRetailer });
});
