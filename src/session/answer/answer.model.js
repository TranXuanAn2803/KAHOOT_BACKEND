const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Answer = mongoose.model(
  "answer",
  new Schema(
    {
      sessionId: {
        type: Schema.Types.ObjectId,
        ref: "sessions",
      },
      presentationId: {
        type: Schema.Types.Number,
      },
      participantId: {
        type: Schema.Types.String,
        ref: "users",
      },
      result: [
        {
          slideIndex: { type: Number },
          optionId: {
            type: Schema.Types.ObjectId,
            ref: "options",
          },
          answered: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    { timestamps: true }
  )
);
module.exports = {Answer};
