const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const GroupPresentation = mongoose.model(
    "group-presentation",
    new Schema(
        {
        presentation_id:{
            type: Schema.Types.ObjectId, 
            ref: 'presentations' 
        },
        group_id:{
            type: Schema.Types.ObjectId, 
            ref: 'groups' 
        },
        current_session:{
            type: String,
            required: false,
        },
        current_slide:{
            type: Number,
            default: 0,
        },


        },
        { timestamps: true }
    )
);
module.exports = GroupPresentation;
