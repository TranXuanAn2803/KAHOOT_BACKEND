const { User } = require("../user/user.model");
const Chat = require("./chat.model");
const Presentation = require("../presentation/presentation.model");

const getAllChat = async (session_id, presentation_id) => {
  console.log("getAllChat ", session_id, presentation_id);
  try {
    const chat = await Chat.find({
      session_id: session_id,
      presentation_id: presentation_id,
    })
      .sort({ createdAt: 1 })
      .lean();
    console.log("chat find ", chat);
    return chat;
  } catch (err) {
    console.error(err);
    return false;
  }
};
const add = async (session_id, presentation_id, username, message) => {
  const present = await Presentation.findOne({ id: presentation_id });
  if (!present) return false;
  try {
    const newChat = {
      session_id: session_id,
      presentation_id: presentation_id,
      message: message,
      created_by: username,
    };
    const chat = await Chat.create(newChat);
    return chat;
  } catch (err) {
    return false;
  }
};
module.exports = {
  getAllChat,
  add,
};
