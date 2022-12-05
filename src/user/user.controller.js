const { UpdateUserById, GetUserByUserName, User } = require("./user.model");

const ReturnCode = {
  Success: 1,
  Fail: 0,
  InvalidMethod: 2,
  InvalidRequestData: 3,
  ErrorInDB: 4,
  HasException: 5,
};

// #region mains controller
const getAllUser = async (req, res) => {
  const users = await User.find();
  return res.send({ users });
};

//handle profile /profile
const HandleProfile = async (req, res) => {
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
      case "GETPROFILE": // get profile
        response = await GetProfile(requestData);
        break;
      case "UPDATEPROFILE": // update profile
        response = await UpdateProfile(requestData);
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

// #endregion

// #region private methods

const GetProfile = async (RequestData) => {
  try {
    if (!Reflect.has(RequestData, "Username")) {
      return CreateResponse(
        ReturnCode.InvalidRequestData,
        "GetProfile fail. RequestData do not contain username"
      );
    }
    var result = await GetUserByUserName(RequestData);
    if (result == null) {
      return CreateResponse(
        ReturnCode.Fail,
        "GetProfile fail. Database return unclear",
        null
      );
    }
    return CreateResponse(ReturnCode.Success, null, result);
  } catch (error) {
    throw new Error(`GetProfile failed: Error[${error}]`);
  }
};

const UpdateProfile = async (RequestData) => {
  try {
    if (!Reflect.has(RequestData, "Id")) {
      return CreateResponse(
        ReturnCode.InvalidRequestData,
        "UpdateProfile fail. RequestData does not contain field Id"
      );
    }
    var result = await UpdateUserById(RequestData);
    console.log("result: ", result);
    if (result == null) {
      return CreateResponse(
        ReturnCode.Fail,
        "UpdateProfile fail. Database return unclear",
        null
      );
    }
    if (!result.Success) {
      return CreateResponse(
        ReturnCode.Fail,
        "UpdateProfile.UpdateUserById fail",
        result
      );
    }
    return CreateResponse(ReturnCode.Success, null, result);
  } catch (error) {
    throw new Error(`UpdateProfile failed: Error[${error}]`);
  }
};

const CreateResponse = async (ReturnCode, Description, ResponseData) => {
  return {
    Code: ReturnCode,
    Description: Description,
    ResponseData: ResponseData,
  };
};

// #endregion

module.exports = {
  getAllUser,
  HandleProfile,
};
