const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Group = mongoose.model(
  "group",
  new Schema(
    {
      id: {
        type: String,
        required: true,
        unique: true,
      },
      name: {
        type: String,
        required: true,
      },
      is_deleted: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  )
);
module.exports = Group;
