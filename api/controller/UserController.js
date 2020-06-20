const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const UserModel = require("../model/UserModel");
const ZoneModel = require("../model/ZoneModel");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const { areObjectIdEqualArrays } = require("../../utils/CommonUtils");

// @desc      Get all users
// @route     GET /api/user
// @access    Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await UserModel.find().exec();

  res.json({
    success: true,
    users,
  });
});

// @desc      Get single user
// @route     GET /api/user/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id);

  if (!user) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc      Create user
// @route     POST /api/user
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    mobileNumber,
    password,
    role,
    isReportingToMd,
    reportingTo,
    zones,
    districts,
    areas,
  } = req.body;

  const user = new UserModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    mobileNumber,
    password,
    role,
    isReportingToMd,
    reportingTo,
    zones,
    districts,
    areas,
  });

  const createdUser = await UserModel.findOne({
    mobileNumber: mobileNumber,
  });

  if (createdUser) {
    return next(
      new ErrorResponse(`${mobileNumber} has already been created`, 400)
    );
  }

  if (!isReportingToMd && reportingTo) {
    console.log("Inside Reporting to");
    const reportingToUser = await UserModel.findOne({
      _id: reportingTo,
    });

    if (!reportingToUser) {
      return next(new ErrorResponse(`${reportingToUser} does not exist`, 400));
    }
  }

  const savedUserDocument = await user.save();

  const {
    zones: savedUserAssignedZones,
    role: savedUserRole,
  } = savedUserDocument;

  let updatePromises = [];

  if (
    savedUserAssignedZones.length &&
    savedUserRole === USER_ROLES_CONSTANTS.REGIONAL_SALES_MANAGER
  ) {
    console.log("iNSIDE Zones");
    const updateZonesPromises = zones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $set: { regionalSalesManagerId: savedUserDocument._id } },
        { new: true, upsert: true }
      );
    });
    updatePromises = updatePromises.concat(updateZonesPromises);
  }

  await Promise.all(updatePromises);

  res.status(201).json({
    success: true,
    user: savedUserDocument,
  });
});

// @desc      Update user
// @route     PUT /api/user/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const user = await UserModel.findById(userId).exec();

  if (!user) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${userId}`, 404)
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "name",
    "mobileNumber",
    "role",
    "isReportingToMd",
    "reportingTo",
    "zones",
    "districts",
    "areas",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${userId}`));
  }

  const { zones: reqZones } = req.body;

  const { role: userRole, zones: userZones } = user;
  let removePromises = [];
  let addPromises = [];

  if (userRole === USER_ROLES_CONSTANTS.REGIONAL_SALES_MANAGER) {
    const areZonesEqual = areObjectIdEqualArrays(user.zones, reqZones);

    if (!areZonesEqual) {
      const removeZonesPromises = userZones.map(async (zoneId) => {
        await ZoneModel.findOneAndUpdate(
          { _id: zoneId },
          { $set: { regionalSalesManagerId: null } }
        );
      });
      removePromises = removePromises.concat(removeZonesPromises);
    }
    await Promise.all(removePromises);

    if (!areZonesEqual && reqZones.length) {
      const updateZonesPromises = reqZones.map(async (zoneId) => {
        await ZoneModel.findOneAndUpdate(
          { _id: zoneId },
          { $set: { regionalSalesManagerId: userId } }
        );
      });
      addPromises = addPromises.concat(updateZonesPromises);
    }

    await Promise.all(addPromises);
  }

  const updatesUser = await UserModel.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user: updatesUser,
  });
});

// @desc      Delete user
// @route     DELETE /api/user/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id).exec();
  const { role: userRole, zones: userZones } = user;

  if (!user) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  let removePromises = [];

  if (
    userZones.length &&
    userRole === USER_ROLES_CONSTANTS.REGIONAL_SALES_MANAGER
  ) {
    const removeZonesPromises = userZones.map(async (zoneId) => {
      await ZoneModel.findOneAndUpdate(
        { _id: zoneId },
        { $set: { regionalSalesManagerId: null } }
      );
    });
    removePromises = removePromises.concat(removeZonesPromises);
  }

  await UserModel.findByIdAndDelete(id).exec();

  await Promise.all(removePromises);

  res.status(200).json({
    success: true,
    data: {},
  });
});
