const mongoose = require("mongoose");
const RetailerModel = require("../model/RetailerModel");
const DistributorModel = require("../model/DistributorModel");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const AreaModel = require("../model/AreaModel");
const BeatAreaModel = require("../model/BeatAreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const { toSentenceCase } = require("../../utils/CommonUtils");

// @desc GET Retailer
// @route GET /api/retailer
exports.getAllRetailers = asyncHandler(async (req, res, next) => {
  const retailers = await RetailerModel.find().exec();

  res.status(200).json({
    success: true,
    retailers,
  });
});

// @desc     Get  Retailer
// @route    GET /api/retailer/:retailerId
exports.getRetailer = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.id;
  const retailer = await RetailerModel.findById(retailerId).exec();

  if (!retailer) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${retailerId}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    retailer,
  });
});

// @desc      Post  Retailer
// @route     POST /api/retailer/
exports.createRetailer = asyncHandler(async (req, res, next) => {
  const retailerName = toSentenceCase(req.body.retailerName);
  const retailerType = req.body.retailerType;
  const gstNumber = req.body.gstNumber;
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const zoneId = req.body.zoneId ? req.body.zoneId : null;
  const districtId = req.body.districtId ? req.body.districtId : null;
  const areaId = req.body.areaId ? req.body.areaId : null;
  const beatAreaId = req.body.beatAreaId ? req.body.beatAreaId : null;
  const distributorId = req.body.distributorId ? req.body.distributorId : null;

  const retailer = new RetailerModel({
    _id: new mongoose.Types.ObjectId(),
    retailerName,
    retailerType,
    contact,
    additionalContacts,
    address,
    gstNumber,
    zoneId,
    districtId,
    areaId,
    beatAreaId,
    distributorId,
  });

  const savedRetailerDocument = await retailer.save();

  if (zoneId) {
    await ZoneModel.findOneAndUpdate(
      { _id: savedRetailerDocument.zoneId },
      { $push: { retailers: savedRetailerDocument._id } },
      { new: true, upsert: true }
    );
  }

  if (districtId) {
    await DistrictModel.findOneAndUpdate(
      { _id: savedRetailerDocument.districtId },
      { $push: { retailers: savedRetailerDocument._id } },
      { new: true, upsert: true }
    );
  }

  if (areaId) {
    await AreaModel.findOneAndUpdate(
      { _id: savedRetailerDocument.areaId },
      { $push: { retailers: savedRetailerDocument._id } },
      { new: true, upsert: true }
    );
  }

  if (beatAreaId) {
    await BeatAreaModel.findOneAndUpdate(
      { _id: savedRetailerDocument.beatAreaId },
      { $push: { retailers: savedRetailerDocument._id } },
      { new: true, upsert: true }
    );
  }

  if (distributorId) {
    await DistributorModel.findOneAndUpdate(
      { _id: savedRetailerDocument.distributorId },
      { $push: { beatAreas: savedRetailerDocument._id } },
      { new: true, upsert: true }
    );
  }

  res.status(201).json({
    success: true,
    retailer: savedRetailerDocument,
  });
});

// @desc      Delete Retailer
// @route     delete /api/retailer/:retailerId
exports.deleteRetailer = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const retailer = await RetailerModel.findById(id).exec();

  if (!retailer) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await retailer.remove();

  res.status(200).json({
    success: true,
    retailer: {},
  });
});

// @desc      Update  Retailer
// @route     PATCH /api/retailer/:retailerId
exports.updateRetailer = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.id;

  const retailer = await RetailerModel.findById(retailerId).exec();

  if (!retailer) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${retailerId}`,
        404
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "retailerName",
    "retailerType",
    "contact",
    "additionalContacts",
    "address",
    "gstNumber",
    "zoneId",
    "districtId",
    "areaId",
    "beatAreaId",
    "distributorId",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${retailerId}`));
  }

  if (req.body.retailerName) {
    req.body.retailerName = toSentenceCase(req.body.retailerName);
  }

  if (
    !req.body.zoneId ||
    !retailer.zoneId ||
    retailer.zoneId.toString() !== req.body.zoneId.toString()
  ) {
    const reqZoneId = req.body.zoneId;
    if (!reqZoneId) {
      // For Empty String in req.body
      console.log("UnAssigning the retailerId from Zone Collection");
      await ZoneModel.findOneAndUpdate(
        { _id: retailer.zoneId },
        { $pull: { retailers: retailerId } }
      );
      req.body.zoneId = null;
    } else if (!retailer.zoneId) {
      await ZoneModel.findOneAndUpdate(
        { _id: reqZoneId },
        {
          $addToSet: {
            retailers: retailerId,
          },
        }
      );
    } else {
      console.log("Updating the retailerId to Zone Collection");
      // Check for created zone
      const reqZone = await ZoneModel.findById(reqZoneId).exec();

      if (!reqZone) {
        return next(
          new ErrorResponse(`Zone Not Found for Id:${reqZoneId}`, 400)
        );
      }

      Promise.all([
        //1.Remove the retailerId from exisiting zone
        await ZoneModel.findOneAndUpdate(
          { _id: retailer.zoneId },
          { $pull: { retailers: retailerId } }
        ),

        //2. Add the retailerId to another zone
        await ZoneModel.findOneAndUpdate(
          { _id: reqZoneId },
          {
            $addToSet: {
              retailers: retailerId,
            },
          }
        ),
      ]);
    }
  }

  if (
    !req.body.districtId ||
    !retailer.districtId ||
    retailer.districtId.toString() !== req.body.districtId.toString()
  ) {
    const reqDistrictId = req.body.districtId;
    if (!reqDistrictId) {
      // Empty String in req.body
      console.log("UnAssigning the retailerId from District Collection");
      await DistrictModel.findOneAndUpdate(
        { _id: retailer.districtId },
        { $pull: { retailers: retailerId } }
      ),
        (req.body.districtId = null);
    } else if (!retailer.districtId) {
      // For Falsy values from DB
      console.log("Assigning the retailerId to District Collection");
      await DistrictModel.findOneAndUpdate(
        { _id: reqDistrictId },
        {
          $addToSet: {
            retailers: retailerId,
          },
        }
      );
    } else {
      // For Truthy Values
      console.log("Updating the retailerId to District Collection");
      // Check for created District
      const reqDistrict = await DistrictModel.findById(reqDistrictId).exec();

      if (!reqDistrict) {
        return next(
          new ErrorResponse(`District Not Found for Id:${reqDistrictId}`, 400)
        );
      }

      Promise.all([
        //1.Remove the retailerId from exisiting zone
        await DistrictModel.findOneAndUpdate(
          { _id: retailer.districtId },
          { $pull: { retailers: retailerId } }
        ),

        //2. Add the retailerId to another zone
        await DistrictModel.findOneAndUpdate(
          { _id: reqDistrictId },
          {
            $addToSet: {
              retailers: retailerId,
            },
          }
        ),
      ]);
    }
  }

  if (
    !req.body.areaId ||
    !retailer.areaId ||
    retailer.areaId.toString() !== req.body.areaId.toString()
  ) {
    const reqAreaId = req.body.areaId;
    if (!reqAreaId) {
      // Empty String in req.body
      console.log("UnAssigning the retailerId from Area Collection");
      await AreaModel.findOneAndUpdate(
        { _id: retailer.areaId },
        { $pull: { retailers: retailerId } }
      );
      req.body.areaId = null;
    } else if (!retailer.areaId) {
      // For Falsy values from DB
      console.log("Assigning the retailerId to Area Collection");
      await AreaModel.findOneAndUpdate(
        { _id: reqAreaId },
        {
          $addToSet: {
            retailers: retailerId,
          },
        }
      );
    } else {
      // For Truthy Values
      console.log("Updating the retailerId to Area Collection");
      // Check for created Area
      const reqArea = await AreaModel.findById(reqAreaId).exec();

      if (!reqArea) {
        return next(
          new ErrorResponse(`Area Not Found for Id:${reqAreaId}`, 400)
        );
      }

      Promise.all([
        //1.Remove the retailerId from exisiting Area
        await AreaModel.findOneAndUpdate(
          { _id: retailer.areaId },
          { $pull: { retailers: retailerId } }
        ),

        //2. Add the retailerId to another Area
        await AreaModel.findOneAndUpdate(
          { _id: reqAreaId },
          {
            $addToSet: {
              retailers: retailerId,
            },
          }
        ),
      ]);
    }
  }

  if (
    !req.body.beatAreaId ||
    !retailer.beatAreaId ||
    retailer.beatAreaId.toString() !== req.body.beatAreaId.toString()
  ) {
    const reqBeatAreaId = req.body.beatAreaId;
    if (!reqBeatAreaId) {
      // Empty String in req.body
      console.log("UnAssigning the retailerId from BeatArea Collection");
      await BeatAreaModel.findOneAndUpdate(
        { _id: retailer.beatAreaId },
        { $pull: { retailers: retailerId } }
      );
      req.body.beatAreaId = null;
    } else if (!retailer.beatAreaId) {
      // For Falsy values from DB
      console.log("Assigning the retailerId to BeatArea Collection");
      await BeatAreaModel.findOneAndUpdate(
        { _id: reqBeatAreaId },
        {
          $addToSet: {
            retailers: retailerId,
          },
        }
      );
    } else {
      // For Truthy Values
      console.log("Updating the retailerId to Beat BeatArea Collection");
      // Check for created District
      const reqBeatArea = await BeatAreaModel.findById(reqBeatAreaId).exec();

      if (!reqBeatArea) {
        return next(
          new ErrorResponse(`BeatArea Not Found for Id:${reqBeatAreaId}`, 400)
        );
      }

      Promise.all([
        //1.Remove the retailerId from exisiting Beat BeatArea
        await BeatAreaModel.findOneAndUpdate(
          { _id: retailer.beatAreaId },
          { $pull: { retailers: retailerId } }
        ),

        //2. Add the retailerId to another Beat BeatArea
        await BeatAreaModel.findOneAndUpdate(
          { _id: reqBeatAreaId },
          {
            $addToSet: {
              retailers: retailerId,
            },
          }
        ),
      ]);
    }
  }

  if (
    !req.body.distributorId ||
    !retailer.distributorId ||
    retailer.distributorId.toString() !== req.body.distributorId.toString()
  ) {
    const reqDistributorId = req.body.distributorId;
    if (!reqDistributorId) {
      // Empty String in req.body
      console.log("UnAssigning the retailerId from Distributor Collection");
      await DistributorModel.findOneAndUpdate(
        { _id: retailer.distributorId },
        { $pull: { retailers: retailerId } }
      );
      req.body.distributorId = null;
    } else if (!retailer.distributorId) {
      // For Falsy values from DB
      console.log("Assigning the retailerId to Distributor Collection");
      await DistributorModel.findOneAndUpdate(
        { _id: reqDistributorId },
        {
          $addToSet: {
            retailers: retailerId,
          },
        }
      );
    } else {
      console.log("Updating the retailerId to Distributor Collection");

      // Check for created zone
      const reqDistributor = await DistributorModel.findById(
        reqDistributorId
      ).exec();

      if (!reqDistributor) {
        return next(
          new ErrorResponse(
            `Distributor Not Found for Id:${reqDistributorId}`,
            400
          )
        );
      }

      Promise.all([
        //1.Remove the retailerId from exisiting Distributor
        await DistributorModel.findOneAndUpdate(
          { _id: retailer.distributorId },
          { $pull: { retailers: retailerId } }
        ),

        //2. Add the retailerId to another Distributor
        await DistributorModel.findOneAndUpdate(
          { _id: reqDistributorId },
          {
            $addToSet: {
              retailers: retailerId,
            },
          }
        ),
      ]);
    }
  }

  const updatedRetailer = await RetailerModel.findByIdAndUpdate(
    retailerId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, retailer: updatedRetailer });
});
