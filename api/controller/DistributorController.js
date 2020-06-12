const mongoose = require("mongoose");
const DistributorModel = require("../model/DistributorModel");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const AreaModel = require("../model/AreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const {
  toSentenceCase,
  areObjectIdEqualArrays,
} = require("../../utils/CommonUtils");

// @desc GET Distributors
// @route GET /api/distributor
exports.getAllDistributors = asyncHandler(async (req, res, next) => {
  const distributors = await DistributorModel.find().exec();

  res.status(200).json({
    success: true,
    distributors,
  });
});

// @desc      Get Distributor
// @route     GET /api/distributor/:distributorId
exports.getDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributor = await DistributorModel.findById(id).exec();

  if (!distributor) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    distributor,
  });
});

// @desc      Post Distributor
// @route     POST /api/distributor/
exports.createDistributor = asyncHandler(async (req, res, next) => {
  const distributorName = toSentenceCase(req.body.distributorName);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const deliveryVehiclesCount = req.body.deliveryVehiclesCount;
  const existingRetailersCount = req.body.existingRetailersCount;
  const currentBrandsDealing = req.body.currentBrandsDealing;
  const zones = req.body.zones;
  const districts = req.body.districts;
  const areas = req.body.areas;

  const distributor = new DistributorModel({
    _id: new mongoose.Types.ObjectId(),
    distributorName,
    contact,
    additionalContacts,
    address,
    gstNumber,
    deliveryVehiclesCount,
    existingRetailersCount,
    currentBrandsDealing,
    zones,
    districts,
    areas,
  });

  const savedDistributorDocument = await distributor.save();
  let updatePromises = [];

  if (zones.length) {
    const updateZonesPromises = zones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $push: { distributors: savedDistributorDocument._id } },
        { new: true, upsert: true }
      );
    });
    updatePromises = updatePromises.concat(updateZonesPromises);
  }

  if (districts.length) {
    const updateDistrictsPromises = districts.map(async (districtId) => {
      await DistrictModel.findOneAndUpdate(
        { _id: districtId },
        { $push: { distributors: savedDistributorDocument._id } },
        { new: true, upsert: true }
      );
    });
    updatePromises = updatePromises.concat(updateDistrictsPromises);
  }

  if (areas.length) {
    const updateAreasPromises = areas.map(async (areaId) => {
      await AreaModel.findOneAndUpdate(
        { _id: areaId },
        { $push: { distributors: savedDistributorDocument._id } },
        { new: true, upsert: true }
      );
    });
    updatePromises = updatePromises.concat(updateAreasPromises);
  }

  await Promise.all(updatePromises);

  res.status(201).json({
    success: true,
    distributor: savedDistributorDocument,
  });
});

// @desc      Delete Distributor
// @route     delete /api/distributor/
exports.deleteDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributor = await DistributorModel.findById(id).exec();

  if (!distributor) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await distributor.remove();

  res.status(200).json({
    success: true,
    distributor: {},
  });
});

// @desc      Update Distributor
// @route     PATCH /api/distributor/:distributorId
exports.updateDistributor = asyncHandler(async (req, res, next) => {
  const distributorId = req.params.id;
  const reqAreas = req.body.areas;
  const reqDistricts = req.body.districts;
  const reqZones = req.body.zones;

  const distributor = await DistributorModel.findById(distributorId).exec();

  if (!distributor) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${distributorId}`,
        404
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "distributorName",
    "contact",
    "additionalContacts",
    "address",
    "gstNumber",
    "deliveryVehiclesCount",
    "existingRetailersCount",
    "currentBrandsDealing",
    "zones",
    "districts",
    "areas",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${distributorId}`));
  }

  if (req.body.distributorName) {
    req.body.distributorName = toSentenceCase(req.body.distributorName);
  }

  let removePromises = [];
  let addPromises = [];
  const areAreasEqual = areObjectIdEqualArrays(distributor.areas, reqAreas);
  const areDistrictsEqual = areObjectIdEqualArrays(
    distributor.districts,
    reqDistricts
  );
  const areZonesEqual = areObjectIdEqualArrays(distributor.zones, reqZones);

  if (!areAreasEqual) {
    console.log("areas removal");
    const removeAreasPromises = distributor.areas.map(async (areaId) => {
      await AreaModel.findOneAndUpdate(
        { _id: areaId },
        { $pull: { distributors: distributorId } }
      );
    });
    removePromises = removePromises.concat(removeAreasPromises);
  }

  if (!areDistrictsEqual) {
    console.log("districts removal");
    const removeDistrictsPromises = distributor.districts.map(
      async (districtId) => {
        await DistrictModel.findOneAndUpdate(
          { _id: districtId },
          { $pull: { distributors: distributorId } }
        );
      }
    );
    removePromises = removePromises.concat(removeDistrictsPromises);
  }

  if (!areZonesEqual) {
    console.log("zones removal");
    const removeAreasPromises = distributor.zones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $pull: { distributors: distributorId } }
      );
    });
    removePromises = removePromises.concat(removeAreasPromises);
  }

  await Promise.all(removePromises);

  if (!areAreasEqual && reqAreas.length) {
    console.log("add areas");
    const updateAreasPromises = reqAreas.map(async (areaId) => {
      await AreaModel.findOneAndUpdate(
        { _id: areaId },
        { $addToSet: { distributors: distributorId } }
      );
    });
    addPromises = addPromises.concat(updateAreasPromises);
  }

  if (!areDistrictsEqual && reqDistricts.length) {
    console.log("add districts");
    const updateDistrictsPromises = reqDistricts.map(async (districtId) => {
      await DistrictModel.findOneAndUpdate(
        { _id: districtId },
        { $addToSet: { distributors: distributorId } }
      );
    });
    addPromises = addPromises.concat(updateDistrictsPromises);
  }

  if (!areZonesEqual && reqZones.length) {
    console.log("add zones");
    const updateZonesPromises = reqZones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $addToSet: { distributors: distributorId } }
      );
    });
    addPromises = addPromises.concat(updateZonesPromises);
  }

  await Promise.all(addPromises);

  const updatedDistributor = await DistributorModel.findByIdAndUpdate(
    distributorId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, distributor: updatedDistributor });
});
