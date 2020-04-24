const mongoose = require("mongoose");
const DivisionModel = require("../model/DivisionModel");
const DistrictModel = require("../model/DistrictModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all divisions
// @route     GET /api/division
exports.getAllDivisions = asyncHandler(async (req, res, next) => {
  const divisions = await DivisionModel.find()
    .select("divisionName divisionCode districtId zoneId")
    .populate({
      path: "beatAreas",
      select: "_id beatAreaName beatAreaCode",
    })
    .exec();

  res.status(200).json({
    success: true,
    divisions,
  });
});

// @desc      Get division
// @route     GET /api/division/:id
exports.getDivision = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const division = await DivisionModel.findById(id)
    .select("divisionName divisionCode districtId")
    .populate({
      path: "beatAreas",
      select: "_id beatAreaName beatAreaId",
    })
    .exec();

  if (!fetchedDivision) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    division,
  });
});

// @desc      Post division
// @route     POST /api/division/
exports.createDivision = asyncHandler(async (req, res, next) => {
  const divisionName = toSentenceCase(req.body.divisionName);
  const divisionCode = toUpperCase(divisionName);

  // Check for created division
  const createdDivision = await DivisionModel.findOne({
    divisionCode,
  });

  if (createdDivision) {
    return next(
      new ErrorResponse(
        `Id:${createdDivision._id} has already been created with Division code: ${divisionCode}`,
        400
      )
    );
  }

  const division = new DivisionModel({
    _id: new mongoose.Types.ObjectId(),
    divisionName,
    divisionCode,
    districtId: req.body.districtId,
    zoneId: req.body.zoneId,
  });

  const savedDocument = await division.save();

  //update the divisionId to District
  await DistrictModel.findOneAndUpdate(
    { _id: req.body.districtId },
    { $push: { divisions: savedDocument._id } },
    { new: true, upsert: true }
  );
  res.status(201).json({
    success: true,
    division: {
      _id: savedDocument._id,
      divisionName: savedDocument.divisionName,
      divisionCode: savedDocument.divisionCode,
    },
  });
});

exports.deleteDivision = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const division = await DivisionModel.findById(id).exec();

  if (!division) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const deleteDivision = () => {
    return DivisionModel.findByIdAndRemove(id).exec();
  };

  const removeDivisionIdFromDistrict = () => {
    return DistrictModel.findOneAndUpdate(
      { _id: division.districtId },
      { $pull: { divisions: id } },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not delete the districtId for division id - ${division._id}`,
              404
            )
          );
        }
      }
    );
  };

  const removeDivisionIdFromBeatAreas = () => {
    return BeatAreaModel.deleteMany({ divisionId: division._id }, (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the Beat Areas for division id - ${division._id}`,
            404
          )
        );
      }
    });
  };

  Promise.all([
    await deleteDivision(),
    await removeDivisionIdFromDistrict(),
    await removeDivisionIdFromBeatAreas(),
  ]);

  res.status(200).json({
    success: true,
    product: {},
  });
});

// @desc      Update Division
// @route     PUT /api/division/
exports.updateDivision = asyncHandler(async (req, res, next) => {
  const divisionName = toSentenceCase(req.body.divisionName);
  const divisionCode = toUpperCase(divisionName);

  const id = req.params.id;
  const division = await DivisionModel.findById(id).exec();

  if (!division) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    divisionName,
    divisionCode,
  };

  const updatedDivision = await DivisionModel.findByIdAndUpdate(
    id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ success: true, division: updatedDivision });
});
