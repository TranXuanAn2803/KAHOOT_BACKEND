const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Question = mongoose.model(
    "question",
    new Schema(
        {
        session_id:{
            type: String,
            required: true,
        },
        presentation_id:{
            type: Schema.Types.ObjectId, 
            ref: 'presentations' 
        },    
        question: {
            type: String,
            required: false,
        },
        vote:{
            type: Number,
            default: 0,
        },
        is_answered:{
            type: Boolean,
            default: false,
        },
        created_by: {
            type: String,
            required: false,
        },
        },
        { timestamps: true }
    )
);
module.exports = Question;
