const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const DivisionModel = require("../model/DivisionModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all zones
// @route     GET /api/zone
exports.getAllZones = asyncHandler(async (req, res, next) => {
  const zones = await ZoneModel.find()
    .select("_id zoneName zoneCode districts")
    .populate({
      path: "districts",
      select: "_id districtName districtCode zoneId",
      populate: {
        path: "divisions",
        select: "_id divisionName divisionCode districtId beatAreas",
        populate: {
          path: "beatAreas",
          select: "_id beatAreaName beatAreaCode",
        },
      },
    })
    .exec();

  res.status(200).json({
    success: true,
    zones,
  });
});

// @desc      Get zone
// @route     GET /api/zone/:id
exports.getZone = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const zone = await ZoneModel.findById(id)
    .select("_id zoneName zoneCode districts")
    .populate({
      path: "districts",
      select: "_id districtName districtCode zoneId",
      populate: {
        path: "divisions",
      },
    });

  if (!fetchedZone) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    zone,
  });
});

// @desc      Post zone
// @route     POST /api/zone/
exports.createZone = asyncHandler(async (req, res, next) => {
  const zoneName = toSentenceCase(req.body.zoneName);
  const zoneCode = toUpperCase(zoneName);

  // Check for created zone
  const createdZone = await ZoneModel.findOne({
    zoneCode,
  });

  if (createdZone) {
    return next(
      new ErrorResponse(
        `Zone name: '${zoneName}' has already been created with Zone code: ${zoneCode}`,
        400
      )
    );
  }

  const zone = new ZoneModel({
    _id: new mongoose.Types.ObjectId(),
    zoneName,
    zoneCode,
  });

  const savedDocument = await zone.save();
  res.status(201).json({
    success: true,
    zone: {
      _id: savedDocument._id,
      zoneName: savedDocument.zoneName,
      zoneCode: savedDocument.zoneCode,
    },
  });
});

exports.deleteZone = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const zone = await ZoneModel.findById(id).exec();

  if (!zone) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  Promise.all([
    ZoneModel.findByIdAndRemove(id).exec(),

    DistrictModel.deleteMany({ zoneId: zone._id }, (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the district for zone id - ${zone._id}`,
            404
          )
        );
      }
    }),

    DivisionModel.deleteMany({ zoneId: zone._id }, (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the division for zone id - ${zone._id}`,
            404
          )
        );
      }
    }),

    BeatAreaModel.deleteMany({ zoneId: zone._id }, (error) => {
      if (error) {
        return next(
          new ErrorResponse(
            `Could not delete the Beat Areas for district id - ${district._id}`,
            404
          )
        );
      }
    }),
  ]);

  res.status(200).json({
    success: true,
    product: {},
  });
});

// @desc      Update Zone
// @route     PUT /api/zone/
exports.updateZone = asyncHandler(async (req, res, next) => {
  const zoneName = toSentenceCase(req.body.zoneName);
  const zoneCode = toUpperCase(zoneName);

  const id = req.params.id;
  const zone = await ZoneModel.findById(id).exec();

  if (!zone) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const dataToUpdate = {
    zoneName,
    zoneCode,
  };

  const updatedZone = await ZoneModel.findByIdAndUpdate(id, dataToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, zone: updatedZone });
});
