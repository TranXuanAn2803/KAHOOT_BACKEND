const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Option = mongoose.model(
    "option",
    new Schema(
        {
        content: {
            type: String,
            required: true,
        },
        slide_id:{
            type: Schema.Types.ObjectId, 
            ref: 'slides' 
        },
        index:{
            type: Number,
            required: true
        }
        },
        { timestamps: true }
    )
);
module.exports = Option;
