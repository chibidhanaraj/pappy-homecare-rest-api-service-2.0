const { cloneDeep } = require('lodash');

const RETAILER_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'beats',
      localField: 'beat',
      foreignField: '_id',
      as: 'beat',
    },
  },
  {
    $unwind: { path: '$beat', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'areas',
      localField: 'beat.area',
      foreignField: '_id',
      as: 'area',
    },
  },
  {
    $unwind: { path: '$area', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'districts',
      localField: 'area.district',
      foreignField: '_id',
      as: 'district',
    },
  },
  {
    $unwind: {
      path: '$district',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'district.zone',
      foreignField: '_id',
      as: 'zone',
    },
  },
  {
    $unwind: {
      path: '$zone',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'distributors',
      localField: 'distributor',
      foreignField: '_id',
      as: 'distributor',
    },
  },
  {
    $unwind: {
      path: '$distributor',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      name: 1,
      contact: 1,
      additional_contacts: 1,
      address: 1,
      gstin: 1,
      retail_type: 1,
      'distributor.id': '$distributor._id',
      'distributor.name': '$distributor.name',
      'beat.id': '$beat._id',
      'beat.name': '$beat.name',
      'area.id': '$area._id',
      'area.name': '$area.name',
      'district.id': '$district._id',
      'district.name': '$district.name',
      'zone.id': '$zone._id',
      'zone.name': '$zone.name',
    },
  },
];

const getUpdatedData = (req, retailer) => {
  const dataToUpdate = {};

  if (req.body.name) {
    dataToUpdate.name = req.body.name;
  }

  if (req.body.retail_type) {
    dataToUpdate.retail_type = req.body.retail_type;
  }

  if (req.body.contact) {
    const existingContact = cloneDeep(retailer.contact.toObject());
    dataToUpdate.contact = {
      ...existingContact,
      ...req.body.contact,
    };
  }

  if (req.body.additional_contacts) {
    dataToUpdate.additional_contacts = req.body.additional_contacts;
  }

  if (req.body.gstin !== undefined && req.body.gstin !== null) {
    dataToUpdate.gstin = req.body.gstin;
  }

  if (req.body.address) {
    const existingAddress = cloneDeep(retailer.address.toObject());
    dataToUpdate.address = {
      ...existingAddress,
      ...req.body.address,
    };
  }

  if (req.body.appointed_areas) {
    dataToUpdate.appointed_areas = req.body.appointed_areas;
  }

  if (req.body.beat !== undefined && req.body.beat !== null) {
    if (!req.body.beat) {
      dataToUpdate.distributor = undefined;
    } else {
      dataToUpdate.beat = req.body.beat;
    }
  }

  if (req.body.distributor !== undefined && req.body.distributor !== null) {
    if (!req.body.distributor) {
      dataToUpdate.distributor = undefined;
    } else {
      dataToUpdate.distributor = req.body.distributor;
    }
  }

  if (req.body.is_appointment_confirmed_by_company) {
    dataToUpdate.is_appointment_confirmed_by_company =
      req.body.is_appointment_confirmed_by_company;
  }

  console.log(dataToUpdate);

  return dataToUpdate;
};

module.exports = {
  RETAILER_AGGREGATE_QUERY,
  getUpdatedData,
};
