const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");
const User = mongoose.model(
  "users",
  new Schema(
    {
      id: {
        type: String,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      name: {
        type: String,
      },
      username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
      },
      is_deleted: {
        type: Boolean,
        default: false,
      },
      is_activated: {
        type: Boolean,
        default: false,
      },
      refreshToken: {
        type: String,
      },
      confirmationCode: {
        type: String,
      },
    },
    { timestamps: true }
  )
);
// module.exports = User;

const GetUserByUserName = async function (RequestData) {
  try {
    if (!Reflect.has(RequestData, "Username")) {
      throw new Error(
        `GetUserByUserName failed. No Username in RequestData[${RequestData}]`
      );
    }
    var query = { username: RequestData.Username };
    var result = await User.findOne(query);
    if (result != null) {
      return {
        id: result._id,
        name: result.name,
        username: result.username,
        email: result.email,
      };
    }
    return null;
  } catch (err) {
    throw new Error(`updateUserById failed. Error[${err}]`);
  }
};

const UpdateUserById = async (RequestData) => {
  try {
    var id = RequestData["Id"];
    var updateObject = {};
    if (Reflect.has(RequestData, "Username")) {
      updateObject["username"] = RequestData["Username"];
    }
    if (Reflect.has(RequestData, "Name")) {
      updateObject["name"] = RequestData["Name"];
    }
    if (Reflect.has(RequestData, "Email")) {
      updateObject["email"] = RequestData["Email"];
    }
    if (updateObject == {}) {
      throw new Error(
        `updateUserById failed. No information required in RequestData[${RequestData}]`
      );
    }
    var result = await User.findByIdAndUpdate({ _id: id }, updateObject);
    if (result == null) {
      return {
        Success: false,
        Message: `UpdateUserById fail. No user has Id[${id}]`,
      };
    }
    return {
      Success: true,
      Message: `UpdateUserById Success`,
    };
  } catch (err) {
    throw new Error(`updateUserById failed. Eror[${err}]`);
  }
};

module.exports = {
  User,
  GetUserByUserName,
  UpdateUserById,
};
