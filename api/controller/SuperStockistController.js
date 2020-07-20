const mongoose = require("mongoose");
const SuperStockistModel = require("../model/SuperStockistModel");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const {
  toSentenceCase,
  areObjectIdEqualArrays,
} = require("../../utils/CommonUtils");
const {
  STATUS,
  SUPER_STOCKIST_CONTROLLER_CONSTANTS,
} = require("../../constants/controller.constants");
const { ERROR_TYPES } = require("../../constants/error.constant");

// @desc GET Super Stockists
// @route GET /api/superstockist
exports.getAllSuperStockists = asyncHandler(async (req, res, next) => {
  const superStockists = await SuperStockistModel.find()
    .populate("zonesPayload districtsPayload", "name")
    .exec();

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    superStockists,
  });
});

// @desc      Get Super Stockist
// @route     GET /api/superstockist/:superstockistId
exports.getSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;
  const superStockist = await SuperStockistModel.findById(
    superStockistId
  ).exec();

  if (!superStockist) {
    return next(
      new ErrorResponse(
        SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    superStockist,
  });
});

// @desc      Post Super Stockist
// @route     POST /api/superstockist/
exports.createSuperStockist = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const existingDistributorsCount = req.body.existingDistributorsCount;
  const currentBrandsDealing = req.body.currentBrandsDealing;
  const zones = req.body.zones || [];
  const districts = req.body.districts || [];

  const superStockist = new SuperStockistModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    contact,
    additionalContacts,
    address,
    gstNumber,
    existingDistributorsCount,
    currentBrandsDealing,
    zones,
    districts,
    createdBy: req.user.id || "",
    updatedBy: req.user.id || "",
  });

  const savedSuperStockistDocument = await superStockist
    .save()
    .then((doc) =>
      doc.populate("zonesPayload districtsPayload", "name").execPopulate()
    );

  let updatePromises = [];

  if (zones.length) {
    const updateZonesPromises = zones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $push: { superStockists: savedSuperStockistDocument._id } },
        { new: true, upsert: true }
      );
    });
    updatePromises = updatePromises.concat(updateZonesPromises);
  }

  if (districts.length) {
    const updateDistrictsPromises = districts.map(async (districtId) => {
      await DistrictModel.findOneAndUpdate(
        { _id: districtId },
        { $push: { superStockists: savedSuperStockistDocument._id } },
        { new: true, upsert: true }
      );
    });
    updatePromises = updatePromises.concat(updateDistrictsPromises);
  }

  await Promise.all(updatePromises);

  res.status(201).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    superStockist: savedSuperStockistDocument,
  });
});

// @desc      Update Super Stockist
// @route     PATCH /api/superstockist/:superstockistId
exports.updateSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;
  const reqDistricts = req.body.districts;
  const reqZones = req.body.zones;

  const superStockist = await SuperStockistModel.findById(
    superStockistId
  ).exec();

  if (!superStockist) {
    return next(
      new ErrorResponse(
        SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "name",
    "contact",
    "additionalContacts",
    "address",
    "gstNumber",
    "existingDistributorsCount",
    "currentBrandsDealing",
    "zones",
    "districts",
    "distributionType",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${superStockistId}`));
  }

  if (req.body.name) {
    req.body.name = toSentenceCase(req.body.name);
  }

  let removePromises = [];
  let addPromises = [];

  const areDistrictsEqual = areObjectIdEqualArrays(
    superStockist.districts,
    reqDistricts
  );
  const areZonesEqual = areObjectIdEqualArrays(superStockist.zones, reqZones);

  if (!areDistrictsEqual) {
    console.log("Removing the Districts for Super Stockist");
    const removeDistrictsPromises = superStockist.districts.map(
      async (districtId) => {
        await DistrictModel.findOneAndUpdate(
          { _id: districtId },
          { $pull: { superStockists: superStockistId } }
        );
      }
    );
    removePromises = removePromises.concat(removeDistrictsPromises);
  }

  if (!areZonesEqual) {
    console.log("Removing the Zones for Super Stockist");
    const removeAreasPromises = superStockist.zones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $pull: { superStockists: superStockistId } }
      );
    });
    removePromises = removePromises.concat(removeAreasPromises);
  }

  await Promise.all(removePromises);

  if (!areDistrictsEqual && reqDistricts.length) {
    console.log("Adding the Districts for Super Stockist");
    const updateDistrictsPromises = reqDistricts.map(async (districtId) => {
      await DistrictModel.findOneAndUpdate(
        { _id: districtId },
        { $addToSet: { superStockists: superStockistId } }
      );
    });
    addPromises = addPromises.concat(updateDistrictsPromises);
  }

  if (!areZonesEqual && reqZones.length) {
    console.log("Adding the Zones for Super Stockist");
    const updateZonesPromises = reqZones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $addToSet: { superStockists: superStockistId } }
      );
    });
    addPromises = addPromises.concat(updateZonesPromises);
  }

  await Promise.all(addPromises);

  const dataToUpdate = {
    updatedBy: req.user.id || "",
    ...req.body,
  };

  const updatedSuperStockist = await SuperStockistModel.findByIdAndUpdate(
    superStockistId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("zonesPayload districtsPayload", "name")
    .exec(function (err, doc) {
      if (err) {
        new ErrorResponse(`SuperStockist Update failure ${req.body.name}`, 400);
      } else {
        res.status(200).json({
          status: STATUS.OK,
          message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
          error: "",
          superStockist: doc,
        });
      }
    });
});

// @desc      Delete Super Stockist
// @route     delete /api/superstockist/:superstockistId
exports.deleteSuperStockist = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const superStockist = await SuperStockistModel.findById(id).exec();

  if (!superStockist) {
    return next(
      new ErrorResponse(
        SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await superStockist.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: "",
    superStockist: {},
  });
});
