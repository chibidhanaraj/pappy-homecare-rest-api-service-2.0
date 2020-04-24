const mongoose = require("mongoose");
const DivisionModel = require("../model/DivisionModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const CustomerModel = require("../model/CustomerModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all beatAreas
// @route     GET /api/beatArea
exports.getAllBeatAreas = asyncHandler(async (req, res, next) => {
  const beatAreas = await BeatAreaModel.find().select("-__v").exec();

  res.status(200).json({
    success: true,
    beatAreas,
  });
});

// @desc      Get beatArea
// @route     GET /api/beatArea/:id
exports.getBeatArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const beatArea = await BeatAreaModel.findById(id).select("-__v").exec();

  if (!fetchedBeatArea) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    beatArea,
  });
});

// @desc      Post beatArea
// @route     POST /api/beatArea/
exports.createBeatArea = asyncHandler(async (req, res, next) => {
  const divisionCode = req.body.divisionCode || ""; // Not saved in db. Used only for Code creation
  const beatAreaName = toSentenceCase(req.body.beatAreaName);
  const beatAreaCode = toUpperCase(divisionCode.concat(beatAreaName));

  // Check for created beatArea
  const createdBeatArea = await BeatAreaModel.findOne({
    beatAreaCode,
  });

  if (createdBeatArea) {
    return next(
      new ErrorResponse(
        `Id:${createdBeatArea._id} has already been created with BeatArea code: ${beatAreaCode}`,
        400
      )
    );
  }

  const beatArea = new BeatAreaModel({
    _id: new mongoose.Types.ObjectId(),
    beatAreaName,
    beatAreaCode,
    divisionId: req.body.divisionId,
    districtId: req.body.districtId,
    zoneId: req.body.zoneId,
  });

  const savedDocument = await beatArea.save();

  //update the beatAreaId to Division
  await DivisionModel.findOneAndUpdate(
    { _id: beatArea.divisionId },
    { $push: { beatAreas: savedDocument._id } },
    { new: true, upsert: true }
  );
  res.status(201).json({
    success: true,
    beatArea: {
      _id: savedDocument._id,
      beatAreaName: savedDocument.beatAreaName,
      beatAreaCode: savedDocument.beatAreaCode,
    },
  });
});

// @desc      Update beatArea
// @route     PUT /api/beatArea/
exports.updateBeatArea = asyncHandler(async (req, res, next) => {
  const beatAreaName = toSentenceCase(req.body.beatAreaName);
  const beatAreaCode = toUpperCase(beatAreaName);
  const assignedCustomers = req.body.assignedCustomers;

  const id = req.params.id;
  const beatArea = await BeatAreaModel.findById(id).exec();

  if (!beatArea) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    beatAreaName,
    beatAreaCode,
    assignedCustomers,
  };

  const updatedBeatArea = await BeatAreaModel.findByIdAndUpdate(
    id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ success: true, beatArea: updatedBeatArea });
});

exports.deleteBeatArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const beatArea = await BeatAreaModel.findById(id).exec();

  if (!beatArea) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const deleteBeatArea = () => {
    return BeatAreaModel.findByIdAndRemove(id).exec();
  };

  const removeBeatAreaIdFromDivisionModel = () => {
    return DivisionModel.findOneAndUpdate(
      { _id: beatArea.divisionId },
      { $pull: { beatAreas: id } },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not remove the beatArea Id in division id - ${beatArea.divisionId}`,
              404
            )
          );
        }
      }
    );
  };

  const removeAssignedBeatAreasFromCustomerModel = () => {
    return CustomerModel.updateMany(
      { customerBeatAreas: id },
      { $pull: { customerBeatAreas: id } },
      { multi: true },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not remove the beatArea Id in customers ${id}`,
              404
            )
          );
        }
      }
    );
  };

  Promise.all([
    await deleteBeatArea(),
    await removeBeatAreaIdFromDivisionModel(),
    await removeAssignedBeatAreasFromCustomerModel(),
  ]);

  res.status(200).json({
    success: true,
    beatArea: {},
  });
});
