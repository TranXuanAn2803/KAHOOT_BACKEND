const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Session = mongoose.model(
  "session",
  new Schema(
    {
      presentationId: {
        type: Schema.Types.ObjectId,
        ref: "presentations",
      },
      type: {
        type: Schema.Types.Number,
      },
      code: {
        type: Schema.Types.String,
      },
      groupId: {
        type: Schema.Types.ObjectId,
        ref: "groups",
      },
      hostId: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      participantList: [{
        type: Schema.Types.ObjectId,
        ref: "users",
      }],
      date: {
        type: Date,
        required: true,
        default: Date.now,
      },
      isLive: {
        type: Boolean,
        default: false,
      },
      answerList: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "answers",
        }
    ]
    },
    { timestamps: true }
  )
);

const createSession = async (RequestData) => {
  try {
      const {PresentationId, Type, GroupId, HostId, ParticipantList, IsLive, AnswerList}= RequestData; 
    var newSession = new Session({
        presentationId: PresentationId,
        type: Type,
        Code: '123456',
        groupId: GroupId,
        hostId: HostId,
        participantList: ParticipantList,
        date: new Date().toISOString(),
        answerList: AnswerList,
        isLive: IsLive,
    });
    var presentationSession = newSession.save();
    return presentationSession;
  } catch (err) {
    throw new Error(`CreateSession failed. Error[${err}]`);
  }
};

module.exports = {
    Session,
    createSession
};