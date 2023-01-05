const { default: mongoose } = require("mongoose");
const { Session, createSession } = require("./session.model");
const { Answer } = require("./answer/answer.model");
exports.HandleSession = async (req, res) => {
  var response;
  try {
    const method = req.body.Method;
    const requestData = JSON.parse(req.body.RequestData);
    if (method == null || method == "" || method.trim() == "") {
      response = CreateResponse(
        ReturnCode.InvalidMethod,
        "No tranmission method",
        null
      );
      return res.status(200).json(response);
    }
    if (requestData == null) {
      response = CreateResponse(
        ReturnCode.InvalidRequestData,
        "No tranmission RequestData",
        null
      );
      return res.status(200).json(response);
    }
    switch (method.toUpperCase()) {
      case "CREATESESSION": // Create Session
        response = await CreateSession(requestData);
        break;
      case "GETSESSION": // Get Session
        response = await GetSession(requestData);
        break;
      default:
        response = CreateResponse(
          ReturnCode.InvalidMethod,
          `No support method[${method}]`
        );
        break;
    }
    return res.status(200).json(response);
  } catch (err) {
    response = CreateResponse(ReturnCode.HasException, `Error[${err}]`, null);
    return res.status(200).json(response);
  }
};

const CreateSession = async (RequestData) => {
  try {
    var result = await createSession(RequestData);
    if (result == null) {
      return CreateResponse(
        ReturnCode.Fail,
        "CreateSession fail. Database return unclear",
        null
      );
    }
    console.log("CreateSession result");
    return CreateResponse(ReturnCode.Success, null, result);
  } catch (error) {
    throw new Error(`CreateSession failed: Error[${error}]`);
  }
};

const GetSession = async (RequestData) => {
  let session;
  try {
    const { Id } = RequestData;
    session = await Session.findById(Id);
    if (session == null) {
      return CreateResponse(
        ReturnCode.Fail,
        `CreateSession fail. Session [${Id}] not found`,
        null
      );
    }
    return CreateResponse(ReturnCode.Success, null, session);
  } catch (err) {
    return CreateResponse(
      ReturnCode.Fail,
      `CreateSession fail. Error [${err}] not found`,
      null
    );
  }
};

const GetAllSessions = async (RequestData) => {
  try {
  } catch (err) {}
};

const UpdateSession = async (RequestData) => {
  try {
    const { Id } = RequestData;
    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return CreateResponse(
        ReturnCode.Fail,
        `UpdateSession fail. Id [${err}] is not valid`,
        null
      );
    }
    const {
      PresentationId,
      GroupId,
      HostId,
      ParticipantList,
      IsLive
    } = RequestData;
    const answerList = await Answer.find({ presentationId: PresentationId });
    var session = await newSession({
      presentationId: PresentationId,
      groupId: GroupId,
      hostId: HostId,
      participantList: ParticipantList,
      answerList: answerList,
      isLive: IsLive,
    });
    const updateSession = await Session.findByIdAndUpdate(Id, session);
    return CreateResponse(ReturnCode.Success, null, updateSession);
  } catch (err) {
    return CreateResponse(
      ReturnCode.Fail,
      `UpdateSession Id[${Id}] fail. Error: ${err}`,
      null
    );
  }
};

const CreateResponse = async (ReturnCode, Description, ResponseData) => {
  return {
    Code: ReturnCode,
    Description: Description,
    ResponseData: ResponseData,
  };
};

const ReturnCode = {
  Success: 1,
  Fail: 0,
  InvalidMethod: 2,
  InvalidRequestData: 3,
  ErrorInDB: 4,
  HasException: 5,
};
