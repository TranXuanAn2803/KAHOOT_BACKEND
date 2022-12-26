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
        }
        },
        { timestamps: true }
    )
);
module.exports = GroupPresentation;
