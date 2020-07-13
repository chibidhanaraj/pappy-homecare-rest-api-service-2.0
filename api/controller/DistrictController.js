const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const AreaModel = require("../model/AreaModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const SuperStockistModel = require("../model/SuperStockistModel");
const DistributorModel = require("../model/DistributorModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");
const {
  STATUS,
  DISTRICT_CONTROLLER_CONSTANTS,
} = require("../../constants/controller.constants");
const { ERROR_TYPES } = require("../../constants/error.constant");

// @desc      Get all districts
// @route     GET /api/district
exports.getAllDistricts = asyncHandler(async (req, res, next) => {
  const districts = await DistrictModel.find().populate("zone", "name").exec();

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    districts,
  });
});

// @desc      Get district
// @route     GET /api/district/:id
exports.getDistrict = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const district = await DistrictModel.findById(id)
    .populate("zone", "name")
    .exec();

  if (!district) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    district,
  });
});

// @desc      Post district
// @route     POST /api/district/
exports.createDistrict = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const districtCode = toUpperCase(name);

  // Check for already created district
  const createdDistrict = await DistrictModel.findOne({
    districtCode,
  });

  if (createdDistrict) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_DUPLICATE_NAME.replace(
          "{{name}}",
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const district = new DistrictModel({
    name,
    districtCode,
    zoneId: req.body.zoneId,
    createdBy: req.user.id || "",
    updatedBy: req.user.id || "",
  });

  const savedDocument = await district
    .save()
    .then((doc) => doc.populate("zone", "name").execPopulate());

  //update the districtId to Zone
  await ZoneModel.findOneAndUpdate(
    { _id: savedDocument.zoneId },
    { $push: { districts: savedDocument._id } },
    { new: true }
  );

  res.status(201).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    district: savedDocument,
  });
});

exports.updateDistrict = asyncHandler(async (req, res, next) => {
  const districtId = req.params.id;
  const district = await DistrictModel.findById(districtId).exec();

  // Check whether the district already exists
  if (!district) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ["name", "zoneId"];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${districtId}`));
  }

  const reqDistrictName = toSentenceCase(req.body.name);
  const reqDistrictCode = toUpperCase(reqDistrictName);

  // Check for duplicates
  if (reqDistrictCode !== district.districtCode) {
    const createdDistrict = await DistrictModel.findOne({
      reqDistrictCode,
    });

    if (createdDistrict) {
      return next(
        new ErrorResponse(
          DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_DUPLICATE_NAME.replace(
            "{{name}}",
            reqDistrictName
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqDistrictName,
    reqDistrictCode,
    updatedBy: req.user.id || "",
  };

  //update the district to changed Zone(if new zoneId)
  if (req.body.zoneId !== district.zoneId) {
    console.log("Updating the districtId to Zone Collection");
    const reqZoneId = req.body.zoneId;
    // Check for the district
    const reqZone = await ZoneModel.findById(reqZoneId).exec();

    if (!reqZone) {
      return next(new ErrorResponse(`Zone Not Found for Id:${reqZoneId}`, 400));
    }

    /* 
      ZoneId is also connected with Super Stockists records.
      Only the removal of ZoneId from Super Stockist for the Only DistrictId being updated is below.
      This is handled seperately as Promise.all below might result in documents update conflicts
    */
    if (district.superStockists.length) {
      const zone = await ZoneModel.findById(district.zoneId).exec();
      const { superStockists } = district;

      await SuperStockistModel.find(
        { _id: { $in: superStockists } },
        (error, docs) => {
          const mappedDistrictsToZone = zone.districts;
          /* Compare each SuperStockist districts and Zone districts for Intersection of the common districts */
          docs.forEach(async (doc) => {
            const commonDistrictIds = doc.districts.filter((districtId) =>
              mappedDistrictsToZone.includes(districtId)
            );

            if (commonDistrictIds.length <= 1) {
              console.log(
                "Removing the ZoneId for the corresponding District Id update to the SuperStockist"
              );
              await SuperStockistModel.findOneAndUpdate(
                { _id: doc._id },
                {
                  $pull: {
                    zones: district.zoneId,
                  },
                }
              );
            }
          });
        }
      );
    }

    /* 
      ZoneId is also connected with Distributors records.
       Only the removal of ZoneId from Super Stockist for the Only DistrictId being updated is below.
      This is handled seperately as Promise.all below might result in documents update conflicts
    */
    if (district.distributors.length) {
      const zone = await ZoneModel.findById(district.zoneId).exec();
      const { distributors } = district;

      await DistributorModel.find(
        { _id: { $in: distributors } },
        (error, docs) => {
          const mappedDistrictsToZone = zone.districts;
          /* Compare each Distributor districts and Zone districts for Intersection of the common districts */
          docs.forEach(async (doc) => {
            const commonDistrictIds = doc.districts.filter((districtId) =>
              mappedDistrictsToZone.includes(districtId)
            );

            if (commonDistrictIds.length <= 1) {
              console.log(
                "Removing the ZoneId for the corresponding District Id update to the Distributor"
              );
              await DistributorModel.findOneAndUpdate(
                { _id: doc._id },
                {
                  $pull: {
                    zones: district.zoneId,
                  },
                }
              );
            }
          });
        }
      );
    }

    await Promise.all([
      //1.Remove the DistrictId, Areas, BeatAreas, Super Stockists, Distributors, from the existing zone
      await ZoneModel.findOneAndUpdate(
        { _id: district.zoneId },
        {
          $pull: {
            districts: districtId,
            areas: { $in: district.areas },
            beatAreas: { $in: district.beatAreas },
            superStockists: { $in: district.superStockists },
            distributors: { $in: district.distributors },
          },
        }
      ),

      //2. Add the DistrictId, Areas, BeatAreas, Super Stockists, Distributors to an another zone
      await ZoneModel.findOneAndUpdate(
        { _id: req.body.zoneId },
        {
          $addToSet: {
            districts: districtId,
            areas: { $each: district.areas },
            beatAreas: { $each: district.beatAreas },
            superStockists: { $each: district.superStockists },
            distributors: { $each: district.distributors },
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

      //5. Update the changed Zone Id to Super Stockist. $addtoSet to handle the duplicates in array
      await SuperStockistModel.updateMany(
        { districts: { $in: districtId } },
        { $addToSet: { zones: reqZoneId } },
        { multi: true }
      ),

      //6. Update the changed Zone Id to distributor. $addtoSet to handle the duplicates in array
      await DistributorModel.updateMany(
        { districts: { $in: districtId } },
        { $addToSet: { zones: reqZoneId } },
        { multi: true }
      ),
    ]);
  }

  const updatedDistrict = await DistrictModel.findByIdAndUpdate(
    districtId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("zone", "name")
    .exec(function (err, doc) {
      if (err) {
        new ErrorResponse(`District update failure ${reqDistrictName}`, 400);
      } else {
        res.status(200).json({
          status: STATUS.OK,
          message: DISTRICT_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
          error: "",
          district: doc,
        });
      }
    });
});

exports.deleteDistrict = asyncHandler(async (req, res, next) => {
  const districtId = req.params.id;
  const district = await DistrictModel.findById(districtId).exec();
  const { zoneId, superStockists, distributors } = district;

  if (!district) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const zone = await ZoneModel.findById(zoneId).exec();

  if (superStockists.length) {
    await SuperStockistModel.find(
      { _id: { $in: superStockists } },
      (error, docs) => {
        const mappedDistrictsToZone = zone.districts;
        docs.forEach(async (doc) => {
          const commonDistrictIds = doc.districts.filter((districtId) =>
            mappedDistrictsToZone.includes(districtId)
          );

          if (commonDistrictIds.length <= 1) {
            console.log(
              "Removing the DistrictId + ZoneId(has only the removing districtId) in Super Stockists records"
            );
            await SuperStockistModel.findOneAndUpdate(
              { _id: doc._id },
              {
                $pull: {
                  zones: district.zoneId,
                  districts: districtId,
                },
              }
            );

            await ZoneModel.findOneAndUpdate(
              { _id: district.zoneId },
              {
                $pull: {
                  superStockists: doc._id,
                },
              }
            );
          } else {
            console.log(
              "Removing Only the DistrictId from Super Stockist Records"
            );
            await SuperStockistModel.findOneAndUpdate(
              { _id: doc._id },
              {
                $pull: {
                  districts: districtId,
                },
              }
            );
          }
        });
      }
    );
  }

  if (distributors.length) {
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
            console.log(
              "Removing Only the DistrictId from  Distributor Records"
            );
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
  }

  await district.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: "",
    district: {},
  });
});
