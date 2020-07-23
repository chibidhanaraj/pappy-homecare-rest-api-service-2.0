const mongoose = require('mongoose');
const WholeSalerModel = require('../model/WholeSalerModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toSentenceCase } = require('../../utils/CommonUtils');

// @desc GET WholeSalers
// @route GET /api/wholesaler
exports.getAllWholeSalers = asyncHandler(async (req, res, next) => {
  const wholeSalers = await WholeSalerModel.find().exec();

  res.status(200).json({
    status: true,
    wholeSalers
  });
});

// @desc      Get WholeSaler
// @route     GET /api/wholesaler/:wholeSalerId
exports.getWholeSaler = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const wholeSaler = await WholeSalerModel.findById(id).exec();

  if (!wholeSaler) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    status: true,
    wholeSaler
  });
});

// @desc      Post WholeSaler
// @route     POST /api/wholesaler/
exports.createWholeSaler = asyncHandler(async (req, res, next) => {
  const wholeSalerName = toSentenceCase(req.body.wholeSalerName);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;

  const wholeSaler = new WholeSalerModel({
    _id: new mongoose.Types.ObjectId(),
    wholeSalerName,
    contact,
    additionalContacts,
    address,
    gstNumber,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || ''
  });

  const savedWholeSalerDocument = await wholeSaler.save();
  res.status(201).json({
    status: true,
    wholeSaler: savedWholeSalerDocument
  });
});

// @desc      Delete WholeSaler
// @route     delete /api/wholesaler/
exports.deleteWholeSaler = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const wholeSaler = await WholeSalerModel.findById(id).exec();

  if (!wholeSaler) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await WholeSalerModel.findByIdAndRemove(id).exec();

  res.status(200).json({
    status: true,
    wholeSaler: {}
  });
});

// @desc      Update WholeSaler
// @route     PATCH /api/wholesaler/:wholeSalerId
exports.updateWholeSaler = asyncHandler(async (req, res, next) => {
  const wholeSalerId = req.params.id;

  const wholeSaler = await WholeSalerModel.findById(wholeSalerId).exec();

  if (!wholeSaler) {
    return next(
      new ErrorResponse(
        `No valid entry found for provided ID ${wholeSalerId}`,
        404
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'wholeSalerName',
    'contact',
    'additionalContacts',
    'address',
    'gstNumber'
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${wholeSalerId}`));
  }

  if (req.body.wholeSalerName) {
    req.body.wholeSalerName = toSentenceCase(req.body.wholeSalerName);
  }

  const dataToUpdate = {
    updatedBy: req.user.id || '',
    ...req.body
  };

  const updatedWholeSaler = await WholeSalerModel.findByIdAndUpdate(
    wholeSalerId,
    dataToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({ status: true, wholeSaler: updatedWholeSaler });
});
