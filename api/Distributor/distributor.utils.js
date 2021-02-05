const { cloneDeep, isEqual } = require('lodash');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');

const DISTRIBUTOR_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'areas',
      localField: 'appointed_areas',
      foreignField: '_id',
      as: 'appointed_areas',
    },
  },
  {
    $unwind: { path: '$appointed_areas', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'districts',
      localField: 'appointed_areas.district',
      foreignField: '_id',
      as: 'appointed_areas.district',
    },
  },
  {
    $unwind: {
      path: '$appointed_areas.district',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'appointed_areas.district.zone',
      foreignField: '_id',
      as: 'appointed_areas.district.zone',
    },
  },
  {
    $unwind: {
      path: '$appointed_areas.district.zone',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'superstockists',
      localField: 'super_stockist',
      foreignField: '_id',
      as: 'super_stockist',
    },
  },
  {
    $unwind: { path: '$super_stockist', preserveNullAndEmptyArrays: true },
  },
  {
    $group: {
      _id: '$_id',
      id: {
        $first: '$_id',
      },
      name: {
        $first: '$name',
      },
      contact: {
        $first: '$contact',
      },
      address: {
        $first: '$address',
      },
      additional_contacts: {
        $first: '$additional_contacts',
      },
      other_brands_dealing_experience: {
        $first: '$other_brands_dealing_experience',
      },
      gstin: {
        $first: '$gstin',
      },
      is_appointment_confirmed_by_company: {
        $first: '$is_appointment_confirmed_by_company',
      },
      distribution_type: {
        $first: '$distribution_type',
      },
      delivery_vehicles_count: {
        $first: '$delivery_vehicles_count',
      },
      existing_retailers_count: {
        $first: '$existing_retailers_count',
      },
      super_stockist: {
        $first: '$super_stockist',
      },
      appointed_areas: {
        $push: {
          $cond: [
            { $gt: ['$appointed_areas._id', null] },
            {
              id: '$appointed_areas._id',
              name: '$appointed_areas.name',
              district: {
                id: '$appointed_areas.district._id',
                name: '$appointed_areas.district.name',
              },
              zone: {
                id: '$appointed_areas.district.zone._id',
                name: '$appointed_areas.district.zone.name',
              },
            },
            '$$REMOVE',
          ],
        },
      },
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      name: 1,
      contact: 1,
      additional_contacts: 1,
      other_brands_dealing_experience: 1,
      address: 1,
      gstin: 1,
      is_appointment_confirmed_by_company: 1,
      distribution_type: 1,
      delivery_vehicles_count: 1,
      existing_retailers_count: 1,
      'super_stockist.id': '$super_stockist._id',
      'super_stockist.name': '$super_stockist.name',
      appointed_areas: 1,
    },
  },
  {
    $sort: {
      name: 1,
    },
  },
];

const getUpdatedData = (req, distributor) => {
  const dataToUpdate = {};

  if (req.body.name) {
    dataToUpdate.name = toWordUpperFirstCase(req.body.name);
  }

  if (req.body.distribution_type) {
    dataToUpdate.distribution_type = req.body.distribution_type;
  }

  if (req.body.contact) {
    const existingContact = cloneDeep(distributor.contact.toObject());
    dataToUpdate.contact = {
      ...existingContact,
      ...req.body.contact,
    };
  }

  if (req.body.additional_contacts) {
    dataToUpdate.additional_contacts = req.body.additional_contacts;
  }

  if (req.body.other_brands_dealing_experience) {
    dataToUpdate.other_brands_dealing_experience =
      req.body.other_brands_dealing_experience;
  }

  if (req.body.gstin !== undefined && req.body.gstin !== null) {
    dataToUpdate.gstin = req.body.gstin;
  }

  if (req.body.address) {
    const existingAddress = cloneDeep(distributor.address.toObject());
    dataToUpdate.address = {
      ...existingAddress,
      ...req.body.address,
    };
  }

  if (req.body.appointed_areas) {
    dataToUpdate.appointed_areas = req.body.appointed_areas;
  }

  if (
    req.body.super_stockist !== undefined &&
    req.body.super_stockist !== null
  ) {
    if (!req.body.super_stockist) {
      dataToUpdate.super_stockist = undefined;
    } else {
      dataToUpdate.super_stockist = req.body.super_stockist;
    }
  }

  if (req.body.existing_retailers_count) {
    dataToUpdate.existing_retailers_count = req.body.existing_retailers_count;
  }

  if (req.body.delivery_vehicles_count) {
    dataToUpdate.delivery_vehicles_count = req.body.delivery_vehicles_count;
  }

  if (req.body.is_appointment_confirmed_by_company) {
    dataToUpdate.is_appointment_confirmed_by_company =
      req.body.is_appointment_confirmed_by_company;
  }

  console.log(dataToUpdate);

  return dataToUpdate;
};

module.exports = {
  DISTRIBUTOR_AGGREGATE_QUERY,
  getUpdatedData,
};
