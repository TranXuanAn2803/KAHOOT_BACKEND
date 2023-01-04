const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Answer = mongoose.model(
    "answer",
    new Schema(
        {
        session_id: {
            type: Schema.Types.ObjectId,
            ref: "session",
        },
        slide_id: {
            type: Schema.Types.Number,
        },
        respondent_id: {
            type: Schema.Types.String,
            ref: "users",
        },
        option_id: {
            type: Schema.Types.ObjectId,
            ref: "options",
        }
        },
        { timestamps: true }
    )
);
module.exports = Session;
