const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all zones
// @route     GET /api/zone
exports.getAllZones = asyncHandler(async (req, res, next) => {
  const zones = await ZoneModel.find().exec();

  res.status(200).json({
    success: true,
    zones,
  });
});

// @desc      Get zone
// @route     GET /api/zone/:id
exports.getZone = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const zone = await ZoneModel.findById(id).select(
    "_id zoneName zoneCode districts"
  );

  if (!zone) {
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
    zone: savedDocument,
  });
});

// @desc      Update Zone
// @route     PATCH /api/zone/:id
exports.updateZone = asyncHandler(async (req, res, next) => {
  const zoneId = req.params.id;

  const zone = await ZoneModel.findById(zoneId).exec();

  if (!zone) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ["zoneName"];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${zoneId}`));
  }

  const zoneName = toSentenceCase(req.body.zoneName);
  const zoneCode = toUpperCase(zoneName);

  const dataToUpdate = {
    zoneName,
    zoneCode,
  };

  const updatedZone = await ZoneModel.findByIdAndUpdate(zoneId, dataToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, zone: updatedZone });
});

exports.deleteZone = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const zone = await ZoneModel.findById(id).exec();

  if (!zone) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await zone.remove();

  res.status(200).json({
    success: true,
    zone: {},
  });
});
