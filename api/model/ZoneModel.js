const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Zone Schema & model
const ZoneSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  zoneName: {
    type: String,
    required: true,
  },
  zoneCode: {
    type: String,
    required: true,
    unique: true,
  },
  districts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
  ],
  areas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },
  ],
  beatAreas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeatArea",
    },
  ],
  distributors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
    },
  ],
  retailers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
    },
  ],
});

// Cascade delete district when a zone is deleted
ZoneSchema.pre("remove", async function (next) {
  console.log(`Districts & Areas being removed for Zone Id: ${this._id}`);
  await Promise.all([
    await this.model("District").deleteMany({ zoneId: this._id }),
    await this.model("Area").deleteMany({ zoneId: this._id }),
    await this.model("BeatArea").deleteMany({ zoneId: this._id }),
    await this.model("Retailer").updateMany(
      { zoneId: this._id },
      {
        $set: {
          zoneId: null,
          districtId: null,
          areaId: null,
          beatAreaId: null,
        },
      },
      { multi: true }
    ),
    await this.model("Distributor").updateMany(
      { _id: { $in: this.distributors } },
      {
        $pull: {
          zones: this._id,
          districts: { $in: this.districts }, //remove the matching districts from distributor
          areas: { $in: this.areas }, //remove the matching areas from distributor
        },
      },
      { multi: true }
    ),
  ]);

  next();
});

// Ensure virtual fields are serialised.
ZoneSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const ZoneModel = mongoose.model("Zone", ZoneSchema);

module.exports = ZoneModel;
