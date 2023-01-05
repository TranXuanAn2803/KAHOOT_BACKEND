const SessionModel = require("./session.model");
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
    var result = await SessionModel.CreateSession(RequestData);
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
