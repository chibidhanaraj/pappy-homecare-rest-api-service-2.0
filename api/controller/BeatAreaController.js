const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const AreaModel = require("../model/AreaModel");
const BeatAreaModel = require("../model/BeatAreaModel");
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

  if (!beatArea) {
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
  const areaCode = req.body.areaCode || ""; // Not saved in db. Used only for Code creation
  const beatAreaName = toSentenceCase(req.body.beatAreaName);
  const beatAreaCode = toUpperCase(areaCode.concat(beatAreaName));

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
    areaId: req.body.areaId,
    districtId: req.body.districtId,
    zoneId: req.body.zoneId,
  });

  const savedDocument = await beatArea.save();

  Promise.all([
    //update the beatAreaId to Zones Collection
    await ZoneModel.findOneAndUpdate(
      { _id: savedDocument.zoneId },
      { $push: { beatAreas: savedDocument._id } },
      { new: true, upsert: true }
    ),
    //update the beatAreaId to Districts Collection
    await DistrictModel.findOneAndUpdate(
      { _id: savedDocument.districtId },
      { $push: { beatAreas: savedDocument._id } },
      { new: true, upsert: true }
    ),

    //update the beatAreaId to Areas Collections
    await AreaModel.findOneAndUpdate(
      { _id: savedDocument.areaId },
      { $push: { beatAreas: savedDocument._id } },
      { new: true, upsert: true }
    ),
  ]);

  res.status(201).json({
    success: true,
    beatArea: savedDocument,
  });
});

exports.deleteBeatArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const beatArea = await BeatAreaModel.findById(id).exec();

  if (!beatArea) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await beatArea.remove();

  res.status(200).json({
    success: true,
    beatArea: {},
  });
});

// @desc      Update beatArea
// @route     PATCH /api/beatArea/
exports.updateBeatArea = asyncHandler(async (req, res, next) => {
  const beatAreaId = req.params.id;
  const beatArea = await BeatAreaModel.findById(beatAreaId).exec();

  // Check whether the beat Area already exists
  if (!beatArea) {
    return next(
      new ErrorResponse(
        `No valid area found for provided ID ${beatAreaId}`,
        404
      )
    );
  }

  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "beatAreaName",
    "areaId",
    "districtId",
    "zoneId",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${beatAreaId}`));
  }

  const reqBeatAreaName = toSentenceCase(req.body.beatAreaName);
  const reqBeatAreaCode = toUpperCase(reqBeatAreaName);

  // Check for duplicates
  if (reqBeatAreaCode !== beatArea.beatAreaCode) {
    console.log("Inside the District");
    const checkBeatArea = await BeatAreaModel.findOne({
      reqBeatAreaCode,
    });

    if (checkBeatArea) {
      return next(
        new ErrorResponse(
          `Beat Area with Name Already exists: ${reqBeatAreaCode}`,
          400
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqBeatAreaName,
    reqBeatAreaCode,
  };

  const updatedBeatArea = await BeatAreaModel.findByIdAndUpdate(
    beatAreaId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  //update the beatArea to changed Area(if new areaId)
  if (req.body.areaId !== beatArea.areaId) {
    console.log("Updating the BeatAreaId to Area Collection");
    const reqAreaId = req.body.areaId;
    // Check for created area
    const reqArea = await AreaModel.findById(reqAreaId).exec();

    if (!reqArea) {
      return next(new ErrorResponse(`Area Not Found for Id:${reqAreaId}`, 400));
    }

    Promise.all([
      //1.Remove the beatAreaId from exisiting area
      await AreaModel.findOneAndUpdate(
        { _id: beatArea.areaId },
        { $pull: { beatAreas: beatAreaId } }
      ),

      //2. Add the beatAreaId to another area
      await AreaModel.findOneAndUpdate(
        { _id: reqAreaId },
        {
          $addToSet: {
            beatAreas: beatAreaId,
          },
        }
      ),
    ]);
  }

  //update the beatArea to changed District(if new districtId)
  if (req.body.districtId !== beatArea.districtId) {
    console.log("Updating the BeatAreaId to District Collection");
    const reqDistrictId = req.body.districtId;
    // Check for created district
    const reqDistrict = await DistrictModel.findById(reqDistrictId).exec();

    if (!reqDistrict) {
      return next(
        new ErrorResponse(`District Not Found for Id:${reqDistrictId}`, 400)
      );
    }

    Promise.all([
      //1.Remove the beatAreaId from exisiting district
      await DistrictModel.findOneAndUpdate(
        { _id: beatArea.districtId },
        { $pull: { beatAreas: beatAreaId } }
      ),

      //2. Add the beatAreaId to another district
      await DistrictModel.findOneAndUpdate(
        { _id: reqDistrictId },
        {
          $addToSet: {
            beatAreas: beatAreaId,
          },
        }
      ),
    ]);
  }

  //update the beatArea to changed Zone(if new zoneId)
  if (req.body.zoneId !== beatArea.zoneId) {
    console.log("Updating the BeatAreaId to Zone Collection");
    const reqZoneId = req.body.zoneId;
    // Check for created zone
    const reqZone = await ZoneModel.findById(reqZoneId).exec();

    if (!reqZone) {
      return next(new ErrorResponse(`Zone Not Found for Id:${reqZone}`, 400));
    }

    Promise.all([
      //1.Remove the beatAreaId from exisiting zone
      await ZoneModel.findOneAndUpdate(
        { _id: beatArea.zoneId },
        { $pull: { beatAreas: beatAreaId } }
      ),

      //2. Add the beatAreaId to another zone
      await ZoneModel.findOneAndUpdate(
        { _id: reqZoneId },
        {
          $addToSet: {
            beatAreas: beatAreaId,
          },
        }
      ),
    ]);
  }
  res.status(200).json({ success: true, beatArea: updatedBeatArea });
});
