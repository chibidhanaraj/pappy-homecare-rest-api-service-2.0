const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const AreaModel = require("../model/AreaModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");
const {
  STATUS,
  BEAT_AREA_CONTROLLER_CONSTANTS,
} = require("../../constants/controller.constants");
const { ERROR_TYPES } = require("../../constants/error.constant");

// @desc      Get all beatAreas
// @route     GET /api/beatArea
exports.getAllBeatAreas = asyncHandler(async (req, res, next) => {
  const beatAreas = await BeatAreaModel.find()
    .populate("zone district area", "name")
    .exec();

  res.status(200).json({
    status: STATUS.OK,
    message: BEAT_AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    beatAreas,
  });
});

// @desc      Get beatArea
// @route     GET /api/beatArea/:id
exports.getBeatArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const beatArea = await BeatAreaModel.findById(id)
    .populate("zone district area", "name")
    .exec();

  if (!beatArea) {
    return next(
      new ErrorResponse(
        BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: BEAT_AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    beatArea,
  });
});

// @desc      Post beatArea
// @route     POST /api/beatArea/
exports.createBeatArea = asyncHandler(async (req, res, next) => {
  const areaCode = req.body.areaCode || ""; // Not saved in db. Used only for Code creation
  const name = toSentenceCase(req.body.name);
  const beatAreaCode = toUpperCase(areaCode.concat(name));

  // Check for created beatArea
  const createdBeatArea = await BeatAreaModel.findOne({
    beatAreaCode,
  });

  if (createdBeatArea) {
    return next(
      new ErrorResponse(
        BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_DUPLICATE_NAME.replace(
          "{{name}}",
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const beatArea = new BeatAreaModel({
    name,
    beatAreaCode,
    areaId: req.body.areaId,
    districtId: req.body.districtId,
    zoneId: req.body.zoneId,
    createdBy: req.user.id || "",
    updatedBy: req.user.id || "",
  });

  const savedDocument = await beatArea
    .save()
    .then((doc) => doc.populate("zone district area", "name").execPopulate());

  await Promise.all([
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
    status: STATUS.OK,
    message: BEAT_AREA_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    beatArea: savedDocument,
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
        BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ["name", "areaId", "districtId", "zoneId"];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${beatAreaId}`));
  }

  const reqBeatAreaName = toSentenceCase(req.body.name);
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
          BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_DUPLICATE_NAME,
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqBeatAreaName,
    reqBeatAreaCode,
    updatedBy: req.user.id || "",
  };

  //update the beatArea to changed Area(if new areaId)
  if (req.body.areaId !== beatArea.areaId) {
    console.log("Updating the BeatAreaId to Area Collection");
    const reqAreaId = req.body.areaId;
    // Check for created area
    const reqArea = await AreaModel.findById(reqAreaId).exec();

    if (!reqArea) {
      return next(new ErrorResponse(`Area Not Found for Id:${reqAreaId}`, 400));
    }

    await Promise.all([
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

    await Promise.all([
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

    await Promise.all([
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

  const updatedBeatArea = await BeatAreaModel.findByIdAndUpdate(
    beatAreaId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("zone district area", "name")
    .exec(function (err, doc) {
      if (err) {
        new ErrorResponse(`Beat update failure ${reqBeatAreaName}`, 400);
      } else {
        res.status(200).json({
          status: STATUS.OK,
          message: BEAT_AREA_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
          error: "",
          beatArea: doc,
        });
      }
    });
});

exports.deleteBeatArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const beatArea = await BeatAreaModel.findById(id).exec();

  if (!beatArea) {
    new ErrorResponse(
      BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_NOT_FOUND,
      404,
      ERROR_TYPES.NOT_FOUND
    );
  }

  await beatArea.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: BEAT_AREA_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: "",
    beatArea: {},
  });
});
