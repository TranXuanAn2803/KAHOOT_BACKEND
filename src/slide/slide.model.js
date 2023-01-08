const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Slide = mongoose.model(
  "slide",
  new Schema(
    {
      question: {
        type: String,
        default: "MULTIPLE_CHOICE",
      },
    //   type: {
    //     type: Schema.Types.Number,
    //     // required: true,
    //   },
      slide_type: {
        type: String,
        enum: ["MULTIPLE_CHOICE", "HEADING", "PARAGRAPH"],
        default: "MULTIPLE_CHOICE",
      },
      presentation_id: {
        type: Schema.Types.ObjectId,
        ref: "presentations",
      },
      index: {
        type: Number,
        required: true,
      },
      answer: [
        {
          type: Schema.Types.ObjectId,
          ref: "options",
          default: null,
        },
      ],
      heading: {
        type: Schema.Types.String,
      },
      paragraph: {
        type: Schema.Types.String,
      },
    },
    { timestamps: true }
  )
);


module.exports = Slide;
