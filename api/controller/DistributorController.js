const mongoose = require("mongoose");
const DistributorModel = require("../model/DistributorModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase } = require("../../utils/CommonUtils");

// @desc GET Distributors
// @route GET /api/distributor
exports.getAllDistributors = asyncHandler(async (req, res, next) => {
  const distributors = await DistributorModel.find().exec();

  res.status(200).json({
    success: true,
    distributors,
  });
});

// @desc      Get Distributor
// @route     GET /api/distributor/:distributorId
exports.getDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributor = await DistributorModel.findById(id).select("-__v").exec();

  if (!distributor) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    distributor,
  });
});

// @desc      Post Distributor
// @route     POST /api/distributor/
exports.createDistributor = asyncHandler(async (req, res, next) => {
  const distributorName = toSentenceCase(req.body.distributorName);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const customerBeatAreas = req.body.customerBeatAreas;

  // Check for created distributor
  const createdDistributor = await DistributorModel.findOne({
    gstNumber,
    distributorName,
  });

  if (createdDistributor) {
    return next(
      new ErrorResponse(
        `'${distributorName}' with id:${createdDistributor._id} has already been created`,
        400
      )
    );
  }

  const distributor = new DistributorModel({
    _id: new mongoose.Types.ObjectId(),
    distributorName,
    contact,
    additionalContacts,
    address,
    gstNumber,
    customerBeatAreas,
  });

  const savedDocument = await distributor.save();
  res.status(201).json({
    success: true,
    distributor: savedDocument,
  });
});

// @desc      Update distributor
// @route     PUT /api/distributor/
exports.updateDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributorName = toSentenceCase(req.body.distributorName);
  const gstNumber = req.body.gstNumber;
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;

  const distributor = await DistributorModel.findById(id).exec();
  if (!distributor) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    distributorName,
    gstNumber,
    contact,
    additionalContacts,
    address,
  };

  const updatedDistributorDetails = await DistributorModel.findByIdAndUpdate(
    id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    },
    (error) => {
      if (error) {
        return next(
          new ErrorResponse(`Could not update the customer id - ${id}`, 404)
        );
      }
    }
  );
  res
    .status(200)
    .json({ success: true, distributor: updatedDistributorDetails });
});

// @desc      Delete Distributor
// @route     delete /api/distributor/
exports.deleteDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributor = await DistributorModel.findById(id).exec();

  if (!distributor) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await DistributorModel.findByIdAndRemove(id).exec();

  res.status(200).json({
    success: true,
    distributor: {},
  });
});
