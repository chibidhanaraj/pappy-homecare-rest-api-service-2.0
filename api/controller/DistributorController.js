const mongoose = require("mongoose");
const DistributorModel = require("../model/DistributorModel");
const ZoneModel = require("../model/ZoneModel");
const DistrictModel = require("../model/DistrictModel");
const SuperStockistModel = require("../model/SuperStockistModel");
const AreaModel = require("../model/AreaModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const {
  toSentenceCase,
  areObjectIdEqualArrays,
} = require("../../utils/CommonUtils");
const {
  buildDistributorPayload,
  buildAllDistributorsPayload,
} = require("../../helpers/DistributorHelper");
const {
  STATUS,
  DISTRIBUTOR_CONTROLLER_CONSTANTS,
} = require("../../constants/controller.constants");
const { ERROR_TYPES } = require("../../constants/error.constant");

// @desc GET Distributors
// @route GET /api/distributor
exports.getAllDistributors = asyncHandler(async (req, res, next) => {
  const distributors = await DistributorModel.find()
    .lean()
    .populate(
      "zonesPayload districtsPayload areasPayload superStockist",
      "name"
    )
    .exec();

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    distributors: buildAllDistributorsPayload(distributors),
  });
});

// @desc      Get Distributor
// @route     GET /api/distributor/:distributorId
exports.getDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributor = await DistributorModel.findById(id)
    .populate(
      "zonesPayload districtsPayload areasPayload superStockist",
      "name"
    )
    .exec();

  if (!distributor) {
    return next(
      new ErrorResponse(
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    distributor: buildDistributorPayload(distributor.toObject()),
  });
});

// @desc      Post Distributor
// @route     POST /api/distributor/
exports.createDistributor = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const deliveryVehiclesCount = req.body.deliveryVehiclesCount;
  const existingRetailersCount = req.body.existingRetailersCount;
  const currentBrandsDealing = req.body.currentBrandsDealing;
  const zones = req.body.zones || [];
  const districts = req.body.districts || [];
  const areas = req.body.areas;
  const superStockistId = req.body.superStockistId || null;

  const distributor = new DistributorModel({
    _id: new mongoose.Types.ObjectId(),
    name,
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
    superStockistId,
    createdBy: req.user.id || "",
    updatedBy: req.user.id || "",
  });

  const savedDistributorDocument = await distributor
    .save()
    .then((doc) =>
      doc
        .populate(
          "zonesPayload districtsPayload areasPayload superStockist",
          "name"
        )
        .execPopulate()
    );

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

  if (superStockistId) {
    await SuperStockistModel.findOneAndUpdate(
      { _id: savedDistributorDocument.superStockistId },
      { $push: { distributors: savedDistributorDocument._id } },
      { new: true, upsert: true }
    );
  }

  await Promise.all(updatePromises);

  console.log(savedDistributorDocument);

  res.status(201).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    distributor: buildDistributorPayload(savedDistributorDocument.toObject()),
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
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
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
    "deliveryVehiclesCount",
    "existingRetailersCount",
    "currentBrandsDealing",
    "zones",
    "districts",
    "areas",
    "superStockistId",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${distributorId}`));
  }

  if (req.body.name) {
    req.body.name = toSentenceCase(req.body.name);
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
    const removeZonesPromises = distributor.zones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $pull: { distributors: distributorId } }
      );
    });
    removePromises = removePromises.concat(removeZonesPromises);
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

  if (
    !req.body.superStockistId ||
    !distributor.superStockistId ||
    distributor.superStockistId.toString() !==
      req.body.superStockistId.toString()
  ) {
    const reqSuperStockistId = req.body.superStockistId;
    if (!reqSuperStockistId) {
      /*
      1.distributor.superStockistId has already been assigned previously
      2.Update now  is empty/null distributor.superStockistId
      3.Pull the DistributorID from SuperStockist
      */
      console.log(
        "UnAssigning the distributorId from SuperStockist Collection"
      );
      await SuperStockistModel.findOneAndUpdate(
        { _id: distributor.superStockistId },
        { $pull: { distributors: distributorId } }
      );
      req.body.superStockistId = null;
    } else if (!distributor.superStockistId) {
      /*
      1.distributor.superStockistId is falsy value previously null/undefined/""
      2. Update now as empty/null distributor.superStockistId
      */
      console.log("Assigning the distributorId to Super Stockist Collection");
      await SuperStockistModel.findOneAndUpdate(
        { _id: reqSuperStockistId },
        {
          $addToSet: {
            distributors: distributorId,
          },
        }
      );
    } else {
      /*
      1.distributor.superStockistId has a assigned value previously 
      2. Update now with new distributor.superStockistId ID
      */
      console.log("Updating the retailerId to Super Stockist  Collection");

      // Check for existing SuperStockist
      const reqSuperStockist = await SuperStockistModel.findById(
        reqSuperStockistId
      ).exec();

      if (!reqSuperStockist) {
        return next(
          new ErrorResponse(
            `Super Stockist Not Found for Id:${reqSuperStockistId}`,
            400
          )
        );
      }

      await Promise.all([
        //1.Remove the distributorId from exisiting Super Stockist
        await SuperStockistModel.findOneAndUpdate(
          { _id: distributor.superStockistId },
          { $pull: { distributors: distributorId } }
        ),

        //2. Add the distributorId to another Super Stockist
        await SuperStockistModel.findOneAndUpdate(
          { _id: reqSuperStockistId },
          {
            $addToSet: {
              distributors: distributorId,
            },
          }
        ),
      ]);
    }
  }

  const dataToUpdate = {
    ...req.body,
    updatedBy: req.user.id || "",
  };

  const updatedDistributor = await DistributorModel.findByIdAndUpdate(
    distributorId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate(
      "zonesPayload districtsPayload areasPayload superStockist",
      "name"
    )
    .exec(function (err, doc) {
      if (err) {
        new ErrorResponse(`Distributor Update failure ${req.body.name}`, 400);
      } else {
        res.status(200).json({
          status: STATUS.OK,
          message: DISTRIBUTOR_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
          error: "",
          distributor: buildDistributorPayload(doc.toObject()),
        });
      }
    });
});

// @desc      Delete Distributor
// @route     delete /api/distributor/
exports.deleteDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributor = await DistributorModel.findById(id).exec();

  if (!distributor) {
    return next(
      new ErrorResponse(
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await distributor.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: "",
    distributor: {},
  });
});
