const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const UserGroup = mongoose.model(
  "user-group",
  new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        group_id: {
            type: String,
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["owner", "co-owner", "member"],
        },

        is_deleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
  )
);
module.exports = UserGroup;
