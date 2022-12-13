const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Slide = mongoose.model(
    "slide",
    new Schema(
        {
        question: {
            type: String,
            required: true,
        },
        type: {
            type: Schema.Types.Number,
            required: true,
        },
        slide_type: {
            type: String,
            default: 'MULTIPLE_CHOICE',
        },
        presentation_id:{
            type: Schema.Types.ObjectId, 
            ref: 'presentations' 
        },
        index:{
            type: Number,
            required: true
        },
        answer: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'options', 
            default: null
        }],
        },
        { timestamps: true }
    )
);
module.exports = Slide;
