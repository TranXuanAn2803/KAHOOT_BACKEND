const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Chat = mongoose.model(
    "chat",
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
        message:
        {
            type: String,
            required: true,
        },
        created_by: {
            type: String,
            required: false,
        },
        },
        { timestamps: true }
    )
);
module.exports = Chat;
