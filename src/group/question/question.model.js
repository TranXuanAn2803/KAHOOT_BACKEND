const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Question = mongoose.model(
    "question",
    new Schema(
        {
        group_id:{
            type: Schema.Types.ObjectId, 
            ref: 'groups' 
        },
        question:
        {
            type: String,
            required: true,
        },
        vote:{
            type: Number,
            default: 0,
        },
        is_answered:{
            type: Boolean,
            default: false,
        }
        },
        { timestamps: true }
    )
);
module.exports = Question;
