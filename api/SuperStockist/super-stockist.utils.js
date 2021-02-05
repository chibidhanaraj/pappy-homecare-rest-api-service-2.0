const { cloneDeep } = require('lodash');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');

const SUPER_STOCKIST_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'districts',
      localField: 'appointed_districts',
      foreignField: '_id',
      as: 'appointed_districts',
    },
  },
  {
    $unwind: { path: '$appointed_districts', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'appointed_districts.zone',
      foreignField: '_id',
      as: 'appointed_districts.zone',
    },
  },
  {
    $unwind: {
      path: '$appointed_districts.zone',
      preserveNullAndEmptyArrays: true,
    },
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
      additional_contacts: {
        $first: '$additional_contacts',
      },
      other_brands_dealing_experience: {
        $first: '$other_brands_dealing_experience',
      },
      address: {
        $first: '$address',
      },
      gstin: {
        $first: '$gstin',
      },
      is_appointment_confirmed_by_company: {
        $first: '$is_appointment_confirmed_by_company',
      },
      existing_distributors_count: {
        $first: '$existing_distributors_count',
      },
      appointed_districts: {
        $push: {
          $cond: [
            { $gt: ['$appointed_districts._id', null] },
            {
              id: '$appointed_districts._id',
              name: '$appointed_districts.name',
              zone: {
                id: '$appointed_districts.zone._id',
                name: '$appointed_districts.zone.name',
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
      _id: 0,
    },
  },
  {
    $sort: {
      name: 1,
    },
  },
];

const getUpdatedData = (req, superStockist) => {
  const dataToUpdate = {};

  if (req.body.name) {
    dataToUpdate.name = toWordUpperFirstCase(req.body.name);
  }

  if (req.body.contact) {
    const existingContact = cloneDeep(superStockist.contact.toObject());
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

  if (req.body.address) {
    const existingAddress = cloneDeep(superStockist.address.toObject());
    dataToUpdate.address = {
      ...existingAddress,
      ...req.body.address,
    };
  }

  if (req.body.gstin) {
    dataToUpdate.gstin = req.body.gstin;
  }

  if (req.body.existing_distributors_count) {
    dataToUpdate.existing_distributors_count =
      req.body.existing_distributors_count;
  }

  if (req.body.appointed_districts) {
    dataToUpdate.appointed_districts = req.body.appointed_districts;
  }

  if (req.body.is_appointment_confirmed_by_company) {
    dataToUpdate.is_appointment_confirmed_by_company =
      req.body.is_appointment_confirmed_by_company;
  }

  return dataToUpdate;
};

module.exports = {
  SUPER_STOCKIST_AGGREGATE_QUERY,
  getUpdatedData,
};
