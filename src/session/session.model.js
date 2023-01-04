const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Session = mongoose.model(
  "session",
  new Schema(
    {
      presentation_id: {
        type: Schema.Types.ObjectId,
        ref: "presentations",
      },
      type: {
        type: Schema.Types.Number,
      },
      code: {
        type: Schema.Types.String,
      },
      group_id: {
        type: Schema.Types.ObjectId,
        ref: "groups",
      },
      host_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
    { timestamps: true }
  )
);

exports.CreateSession = async (RequestData) => {
  try {
      
      var newPresentationSession = {
          _id: new mongoose.Types.ObjectId(),
          presentation_id: RequestData.PresentationId,
          type: RequestData.Type,
          code: "1243456",
          group_id: null,
          host_id: RequestData.HostId,
        };
        console.log("RequestData:", RequestData);
    var presentationSession = await Session.create(newPresentationSession);
    console.log("new: ", newPresentationSession);
    if (presentationSession == null) {
      throw new Error(`Presentation trả về null`);
    }
    console.log(presentationSession);
    return presentationSession;
  } catch (err) {
    throw new Error(`CreateSession failed. Error[${err}]`);
  }
};
