const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const UserOption = mongoose.model(
    "user-options",
    new Schema(
        {
        option_id:{
            type: Schema.Types.ObjectId, 
            ref: 'slides' 
        },
        username:{
            type: String,
            required: true
        },
        user_id:{
            type: Schema.Types.ObjectId, 
            ref: 'users' 
        }
        },
        { timestamps: true }
    )
);
module.exports = UserOption;
