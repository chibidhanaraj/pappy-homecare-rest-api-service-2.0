const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const AreaModel = require("../model/AreaModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toUpperCase, toSentenceCase } = require("../../utils/CommonUtils");
const DistributorModel = require("../model/DistributorModel");
const {
  STATUS,
  AREA_CONTROLLER_CONSTANTS,
} = require("../../constants/controller.constants");
const { ERROR_TYPES } = require("../../constants/error.constant");

// @desc      Get all areas
// @route     GET /api/area
exports.getAllAreas = asyncHandler(async (req, res, next) => {
  const areas = await AreaModel.find().populate("zone district", "name").exec();

  res.status(200).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    areas,
  });
});

// @desc      Get area
// @route     GET /api/area/:id
exports.getArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const area = await AreaModel.findById(id)
    .populate("zone district", "name")
    .exec();

  if (!area) {
    return next(
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    area,
  });
});

// @desc      Post area
// @route     POST /api/area/
exports.createArea = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const areaCode = toUpperCase(name);

  // Check for created area
  const createdArea = await AreaModel.findOne({
    areaCode,
  });

  if (createdArea) {
    return next(
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_DUPLICATE_NAME.replace("{{name}}", name),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const area = new AreaModel({
    name,
    areaCode,
    districtId: req.body.districtId,
    zoneId: req.body.zoneId,
    createdBy: req.user.id || "",
    updatedBy: req.user.id || "",
  });

  const savedDocument = await area
    .save()
    .then((doc) => doc.populate("zone district", "name").execPopulate());

  await Promise.all([
    //update the areaId to Zones Collection
    await ZoneModel.findOneAndUpdate(
      { _id: savedDocument.zoneId },
      { $push: { areas: savedDocument._id } },
      { new: true, upsert: true }
    ),
    //update the areaId to Districts Collection
    await DistrictModel.findOneAndUpdate(
      { _id: req.body.districtId },
      { $push: { areas: savedDocument._id } },
      { new: true, upsert: true }
    ),
  ]);

  res.status(201).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    area: savedDocument,
  });
});

// @desc      Update area
// @route     PUT /api/area/
exports.updateArea = asyncHandler(async (req, res, next) => {
  const areaId = req.params.id;
  const area = await AreaModel.findById(areaId).exec();

  // Check whether the area already exists
  if (!area) {
    return next(
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ["name", "districtId", "zoneId"];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${areaId}`));
  }

  const reqAreaName = toSentenceCase(req.body.name);
  const reqAreaCode = toUpperCase(reqAreaName);

  // Check for duplicates
  if (reqAreaCode !== area.areaCode) {
    const checkArea = await AreaModel.findOne({
      reqAreaCode,
    });

    if (checkArea) {
      return next(
        new ErrorResponse(
          AREA_CONTROLLER_CONSTANTS.AREA_DUPLICATE_NAME.replace(
            "{{name}}",
            reqAreaName
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqAreaName,
    reqAreaCode,
    updatedBy: req.user.id || "",
  };

  //update the area to changed District(if new districtId)
  if (req.body.districtId !== area.districtId) {
    console.log("Updating the areaId to District Collection");
    const reqDistrictId = req.body.districtId;
    // Check for the district
    const reqDistrict = await DistrictModel.findById(reqDistrictId).exec();

    if (!reqDistrict) {
      return next(
        new ErrorResponse(`District Not Found for Id:${reqDistrictId}`, 400)
      );
    }

    /* districtId is also connected with Distributors records. Only the removal of districtId from distributors is below.
      This is handled seperately as Promise.all below might result in documents update conflicts
    */
    if (area.distributors.length) {
      const district = await DistrictModel.findById(area.districtId).exec();
      const zone = await ZoneModel.findById(area.zoneId).exec();
      const { distributors } = area;

      await DistributorModel.find(
        { _id: { $in: distributors } },
        (error, docs) => {
          const mappedAreasToDistrict = district.areas;
          const mappedDistrictsToZone = zone.districts;
          docs.forEach(async (doc) => {
            // To find Intersection between distributor.areas and district.areas.
            // district.areas will give the exact territory mapped areas
            const commonAreaIds = doc.areas.filter((area) =>
              mappedAreasToDistrict.includes(area)
            );

            // To find Intersection between distributor.districts and zone.districts.
            // zone.districts will give the exact territory mapped districts
            const commonDistrictIds = doc.districts.filter((districtId) =>
              mappedDistrictsToZone.includes(districtId)
            );

            /* Only Area in Only District in Only Area in the distributor
            Hence we will remove the districtId and zoneId
            */
            if (commonAreaIds.length <= 1 && commonDistrictIds.length <= 1) {
              await DistributorModel.findOneAndUpdate(
                { _id: doc._id },
                {
                  $pull: {
                    districts: area.districtId,
                    zones: area.zoneId,
                  },
                }
              );
            } else if (commonAreaIds.length <= 1) {
              await DistributorModel.findOneAndUpdate(
                { _id: doc._id },
                {
                  $pull: {
                    districts: area.districtId,
                  },
                }
              );
            }
          });
        }
      );
    }

    await Promise.all([
      //1.Remove the area from existing district
      await DistrictModel.findOneAndUpdate(
        { _id: area.districtId },
        {
          $pull: {
            areas: areaId,
            beatAreas: { $in: area.beatAreas },
            distributors: { $in: area.distributors },
          },
        }
      ),

      //2. Add the area to another district
      await DistrictModel.findOneAndUpdate(
        { _id: reqDistrictId },
        {
          $addToSet: {
            areas: areaId,
            beatAreas: { $each: area.beatAreas },
            distributors: { $each: area.distributors },
          },
        }
      ),

      //3. Update the changed District Id to Beat Area
      await BeatAreaModel.updateMany(
        { areaId: areaId },
        { $set: { districtId: reqDistrictId } },
        { multi: true }
      ),

      //4. Update the District Id to distributor.  $addtoSet to handle the duplicates in array
      await DistributorModel.updateMany(
        { areas: { $in: areaId } },
        { $addToSet: { districts: reqDistrictId } },
        { multi: true }
      ),
    ]);
  }

  //update the area to changed Zone(if new zoneId)
  if (req.body.zoneId !== area.zoneId) {
    console.log("Updating the areaId to Zone Collection");
    const reqZoneId = req.body.zoneId;
    // Check for the district
    const reqZone = await ZoneModel.findById(reqZoneId).exec();

    if (!reqZone) {
      return next(new ErrorResponse(`Zone Not Found for Id:${reqZoneId}`, 400));
    }

    await Promise.all([
      //1.Remove the area from existing zone
      await ZoneModel.findOneAndUpdate(
        { _id: area.zoneId },
        {
          $pull: {
            areas: areaId,
            beatAreas: { $in: area.beatAreas },
          },
        }
      ),

      //2. Add the area to another zone
      await ZoneModel.findOneAndUpdate(
        { _id: reqZoneId },
        {
          $addToSet: {
            areas: areaId,
            beatAreas: { $each: area.beatAreas },
          },
        }
      ),

      //3. Update the changed Zone Id to Beat Area
      await BeatAreaModel.updateMany(
        { areaId: areaId },
        { $set: { zoneId: reqZoneId } },
        { multi: true }
      ),

      //4. Update the Zone Id to distributor.  $addtoSet to handle the duplicates in array
      await DistributorModel.updateMany(
        { areas: { $in: areaId } },
        { $addToSet: { zones: reqZoneId } },
        { multi: true }
      ),
    ]);
  }

  const updatedarea = await AreaModel.findByIdAndUpdate(areaId, dataToUpdate, {
    new: true,
    runValidators: true,
  })
    .populate("zone district", "name")
    .exec(function (err, doc) {
      if (err) {
        new ErrorResponse(`Area update failure ${reqAreaName}`, 400);
      } else {
        res.status(200).json({
          status: STATUS.OK,
          message: AREA_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
          error: "",
          area: doc,
        });
      }
    });
});

exports.deleteArea = asyncHandler(async (req, res, next) => {
  const areaId = req.params.id;
  const area = await AreaModel.findById(areaId).exec();
  const { distributors, districtId, zoneId } = area;

  if (!area) {
    new ErrorResponse(
      AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
      404,
      ERROR_TYPES.NOT_FOUND
    );
  }

  /* 
  This removal of the area id is standalone deletion as arrays are involved. 
  Client has flexibility in adding the territories to the Distributor
  Hence, deletion of the area requires updates in several collections
  */
  const district = await DistrictModel.findById(districtId).exec();
  const zone = await ZoneModel.findById(zoneId).exec();
  if (distributors.length)
    await DistributorModel.find(
      { _id: { $in: distributors } },
      (error, docs) => {
        const mappedAreasToDistrict = district.areas;
        const mappedDistrictsToZone = zone.districts;
        docs.forEach(async (doc) => {
          // To find Intersection between distributor.areas and district.areas.
          // district.areas will give the exact territory mapped areas
          const commonAreaIds = doc.areas.filter((area) =>
            mappedAreasToDistrict.includes(area)
          );

          // To find Intersection between distributor.districts and zone.districts.
          // zone.districts will give the exact territory mapped districts
          const commonDistrictIds = doc.districts.filter((districtId) =>
            mappedDistrictsToZone.includes(districtId)
          );

          // Only Area in Only District in Only Zone. Take down the ids
          if (commonAreaIds.length <= 1 && commonDistrictIds.length <= 1) {
            console.log("Zones, dist, distributor");
            await DistributorModel.findOneAndUpdate(
              { _id: doc._id },
              {
                $pull: {
                  zones: zoneId,
                  districts: districtId,
                  areas: areaId,
                },
              }
            );

            await DistrictModel.findOneAndUpdate(
              { _id: districtId },
              {
                $pull: {
                  distributors: doc._id,
                },
              }
            );

            await ZoneModel.findOneAndUpdate(
              { _id: zoneId },
              {
                $pull: {
                  distributors: doc._id,
                },
              }
            );
          }
          // Only Area in Only District Take down the ids
          else if (commonAreaIds.length <= 1) {
            console.log("dist, distributor");
            await DistributorModel.findOneAndUpdate(
              { _id: doc._id },
              {
                $pull: {
                  districts: districtId,
                  areas: areaId,
                },
              }
            );

            await DistrictModel.findOneAndUpdate(
              { _id: districtId },
              {
                $pull: {
                  distributors: doc._id,
                },
              }
            );
          }
          // Only Area.Take down the id
          else {
            console.log("distributor");
            await DistributorModel.findOneAndUpdate(
              { _id: doc._id },
              {
                $pull: {
                  areas: areaId,
                },
              }
            );
          }
        });
      }
    );

  await area.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: "",
    area: {},
  });
});
