const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Presentation = mongoose.model(
  "presentation",
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      status: {
        type: Number,
        default: 0,
      },
      link_code: {
        type: String,
        required: true,
      },
      current_session:{
        type: String,
        required: false,
        default: "",
      },
      current_slide:{
        type: Number,
        default: 0,
      },


      collaborators: [
        {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
      ],
      created_by: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
    { timestamps: true }
  )
);
module.exports = Presentation;
