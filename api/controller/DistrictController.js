const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const AreaModel = require("../model/AreaModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const DistributorModel = require("../model/DistributorModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");

// @desc      Get all districts
// @route     GET /api/district
exports.getAllDistricts = asyncHandler(async (req, res, next) => {
  const districts = await DistrictModel.find().exec();

  res.status(200).json({
    success: true,
    districts,
  });
});

// @desc      Get district
// @route     GET /api/district/:id
exports.getDistrict = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const district = await DistrictModel.findById(id).exec();

  if (!district) {
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

  // Check for already created district
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
    { _id: savedDocument.zoneId },
    { $push: { districts: savedDocument._id } },
    { new: true }
  );

  res.status(201).json({
    success: true,
    district: savedDocument,
  });
});

exports.deleteDistrict = asyncHandler(async (req, res, next) => {
  const districtId = req.params.id;
  const district = await DistrictModel.findById(districtId).exec();
  const { zoneId, distributors } = district;

  if (!district) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${districtId}`,
        404
      )
    );
  }

  const zone = await ZoneModel.findById(zoneId).exec();
  if (distributors.length)
    await DistributorModel.find(
      { _id: { $in: distributors } },
      (error, docs) => {
        const mappedDistrictsToZone = zone.districts;
        docs.forEach(async (doc) => {
          const commonDistrictIds = doc.districts.filter((districtId) =>
            mappedDistrictsToZone.includes(districtId)
          );

          if (commonDistrictIds.length <= 1) {
            console.log("Inside <=1 ");
            await DistributorModel.findOneAndUpdate(
              { _id: doc._id },
              {
                $pull: {
                  zones: district.zoneId,
                  districts: districtId,
                  areas: { $in: district.areas }, //remove the matching areas from distributor
                },
              }
            );

            await ZoneModel.findOneAndUpdate(
              { _id: district.zoneId },
              {
                $pull: {
                  distributors: doc._id,
                },
              }
            );
          } else {
            console.log("Inside > 1 ");
            await DistributorModel.findOneAndUpdate(
              { _id: doc._id },
              {
                $pull: {
                  districts: districtId,
                  areas: { $in: district.areas }, //remove the matching areas from distributor
                },
              }
            );
          }
        });
      }
    );

  await district.remove();

  res.status(200).json({
    success: true,
    product: {},
  });
});

exports.updateDistrict = asyncHandler(async (req, res, next) => {
  const districtId = req.params.id;
  const district = await DistrictModel.findById(districtId).exec();

  // Check whether the district already exists
  if (!district) {
    return next(
      new ErrorResponse(`No valid district found for provided ID ${id}`, 404)
    );
  }

  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ["districtName", "zoneId"];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${districtId}`));
  }

  const reqDistrictName = toSentenceCase(req.body.districtName);
  const reqDistrictCode = toUpperCase(reqDistrictName);

  // Check for duplicates
  if (reqDistrictCode !== district.districtCode) {
    const createdDistrict = await DistrictModel.findOne({
      reqDistrictCode,
    });

    if (createdDistrict) {
      return next(
        new ErrorResponse(
          `District Name Already exists: ${reqDistrictCode}`,
          400
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqDistrictName,
    reqDistrictCode,
  };

  const updatedDistrict = await DistrictModel.findByIdAndUpdate(
    districtId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  //update the district to changed Zone(if new zoneId)
  if (req.body.zoneId !== district.zoneId) {
    console.log("Updating the districtId to Zone Collection");
    const reqZoneId = req.body.zoneId;
    // Check for the district
    const reqZone = await ZoneModel.findById(reqZoneId).exec();

    if (!reqZone) {
      return next(new ErrorResponse(`Zone Not Found for Id:${reqZoneId}`, 400));
    }

    await Promise.all([
      //1.Remove the DistrictId, Areas, BeatAreas from exisiting zone
      await ZoneModel.findOneAndUpdate(
        { _id: district.zoneId },
        {
          $pull: {
            districts: districtId,
            areas: { $in: district.areas },
            beatAreas: { $in: district.beatAreas },
          },
        }
      ),

      //2. Add the DistrictId, Areas, BeatAreas to another zone
      await ZoneModel.findOneAndUpdate(
        { _id: req.body.zoneId },
        {
          $addToSet: {
            districts: districtId,
            areas: { $each: district.areas },
            beatAreas: { $each: district.beatAreas },
          },
        }
      ),

      //3. Update the changed Zone Id to Areas
      await AreaModel.updateMany(
        { districtId: districtId },
        { $set: { zoneId: reqZoneId } },
        { multi: true }
      ),

      //4. Update the changed Zone Id to Beat Areas
      await BeatAreaModel.updateMany(
        { districtId: districtId },
        { $set: { zoneId: reqZoneId } },
        { multi: true }
      ),
    ]);
  }

  res.status(200).json({ success: true, district: updatedDistrict });
});
