const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const DivisionModel = require("../model/DivisionModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all districts
// @route     GET /api/district
exports.getAllDistricts = asyncHandler(async (req, res, next) => {
  const districts = await DistrictModel.find()
    .select("_id districtName districtCode divisions zoneId")
    .populate({
      path: "divisions",
      select: "_id divisionName divisionCode districtId beatAreas",
      populate: {
        path: "beatAreas",
        select: "_id beatAreaName beatAreaCode",
      },
    })
    .exec();

  res.status(200).json({
    success: true,
    districts,
  });
});

// @desc      Get district
// @route     GET /api/district/:id
exports.getDistrict = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const district = await DistrictModel.findById(id)
    .populate({
      path: "divisions",
      select: "_id divisionName divisionCode districtId beatAreas",
      populate: {
        path: "beatAreas",
        select: "_id beatAreaName beatAreaId",
      },
    })
    .exec();

  if (!fetchedDistrict) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    district,
  });
});

// @desc      Post district
// @route     POST /api/district/
exports.createDistrict = asyncHandler(async (req, res, next) => {
  const districtName = toSentenceCase(req.body.districtName);
  const districtCode = toUpperCase(districtName);

  // Check for created district
  const createdDistrict = await DistrictModel.findOne({
    districtCode,
  });

  if (createdDistrict) {
    return next(
      new ErrorResponse(
        `Id:${createdDistrict._id} has already been created with District code: ${districtCode}`,
        400
      )
    );
  }

  const district = new DistrictModel({
    _id: new mongoose.Types.ObjectId(),
    districtName,
    districtCode,
    zoneId: req.body.zoneId,
  });

  const savedDocument = await district.save();

  //update the districtId to Zone
  await ZoneModel.findOneAndUpdate(
    { _id: req.body.zoneId },
    { $push: { districts: savedDocument._id } },
    { new: true }
  );
  res.status(201).json({
    success: true,
    district: {
      _id: savedDocument._id,
      districtName: savedDocument.districtName,
      districtCode: savedDocument.districtCode,
    },
  });
});

exports.deleteDistrict = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const district = await DistrictModel.findById(id).exec();

  if (!district) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const deleteDistrict = () => {
    return DistrictModel.findByIdAndRemove(id).exec();
  };

  const removeDistrictIdFromZone = () => {
    return ZoneModel.findOneAndUpdate(
      { _id: district.zoneId },
      { $pull: { districts: id } },
      (error) => {
        if (error) {
          return next(
            new ErrorResponse(
              `Could not delete the zoneId for district id - ${district._id}`,
              404
            )
          );
        }
      }
    );
  };

  const removeDistrictIdFromDivisions = () => {
    return DivisionModel.deleteMany({ districtId: district._id }, (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the divisions for district id - ${district._id}`,
            404
          )
        );
      }
    });
  };

  const removeDistrictIdFromBeatAreas = () => {
    return BeatAreaModel.deleteMany({ districtId: district._id }, (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the Beat Areas for district id - ${district._id}`,
            404
          )
        );
      }
    });
  };

  Promise.all([
    await deleteDistrict(),
    await removeDistrictIdFromZone(),
    await removeDistrictIdFromDivisions(),
    await removeDistrictIdFromBeatAreas(),
  ]);

  res.status(200).json({
    success: true,
    product: {},
  });
});

// @desc      Update District
// @route     PUT /api/district/
exports.updateDistrict = asyncHandler(async (req, res, next) => {
  const districtName = toSentenceCase(req.body.districtName);
  const districtCode = toUpperCase(districtName);

  const id = req.params.id;
  const district = await DistrictModel.findById(id).exec();

  if (!district) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    districtName,
    districtCode,
  };

  const updatedDistrict = await DistrictModel.findByIdAndUpdate(
    id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ success: true, district: updatedDistrict });
});
